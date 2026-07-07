import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, drive_v3} from 'googleapis';
import { Readable } from 'stream';

@Injectable()
export class DriveService implements OnModuleInit {
    private drive: drive_v3.Drive;

    constructor(private configService: ConfigService) {}

    onModuleInit() {
        const auth = new google.auth.GoogleAuth({
            keyFile: this.configService.get<string>('GOOGLE_SERVICE_ACCOUNT_KEY_PATH'),
            scopes: ['https://www.googleapis.com/auth/drive'],
        });

        this.drive = google.drive({ version: 'v3', auth });
    }

    // For flatten types
    // async listFilesInFolder(folderId: string){
    //     const response = await this.drive.files.list({
    //         q: `'${folderId}' in parents and trashed = false`,
    //         fields: 'files(id, name, mimeType, webViewLink, modifiedTime, size)',
    //     });

    //     return response.data.files ?? [];
    // }

    private readonly FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';

    async listFilesInFolder(folderId: string): Promise<drive_v3.Schema$File[]> {
        const response = await this.drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: 'files(id, name, mimeType, webViewLink, modifiedTime, size)',
        });


        const items = response.data.files ?? [];
        const files: drive_v3.Schema$File[] = [];

        for(const item of items){
            if(item.mimeType === this.FOLDER_MIME_TYPE){
                const nestedFiles = await this.listFilesInFolder(item.id as string);
                files.push(...nestedFiles);
            } else {
                files.push(item);
            }
        }

        return files;
    }

    async getFileStream(driveFileId: string){
        const response = await this.drive.files.get(
            { fileId: driveFileId, alt: 'media'},
            { responseType: 'stream' },
        );
        return response.data;
    }

    /**
     * Gets the native Google Drive embeddable preview URL.
     * This is MUCH more reliable than manually piping streams for images, PDFs, and docs.
     */
    async getNativePreviewUrl(fileId: string): Promise<string | null> {
        try {
            const response = await this.drive.files.get({
                fileId: fileId,
                fields: 'webViewLink, mimeType',
            });
            
            // For native Google Docs/Sheets/Slides, use their specific webViewLink
            if (response.data.mimeType?.startsWith('application/vnd.google-apps')) {
                return response.data.webViewLink || `https://drive.google.com/file/d/${fileId}/preview`;
            }
            
            // For standard files (images, PDFs, videos), use the standard preview link
            return `https://drive.google.com/file/d/${fileId}/preview`;
        } catch (error) {
            return null;
        }
    }

    /**
     * Detects the service account's permission level on a specific file/folder.
     */
    async getMyPermission(fileId: string): Promise<string | null> {
        try {
            // We need the service account's email to find its specific permission
            const auth = this.configService.get<string>('GOOGLE_SERVICE_ACCOUNT_KEY_PATH');
            // A quick trick to get the email without reading the file again if possible, 
            // but for safety we query the permissions list.
            const permsResponse = await this.drive.permissions.list({
                fileId: fileId,
                fields: 'permissions(id, role, emailAddress)',
            });

            const permissions = permsResponse.data.permissions || [];
            
            // Find the permission where the emailAddress matches the service account
            // If it's not explicitly listed, it usually means 'reader' via domain sharing or link sharing
            for (const p of permissions) {
                if (p.emailAddress && p.emailAddress.includes('iam.gserviceaccount.com')) {
                    return p.role || 'reader';
                }
            }

            return 'reader'; // Default fallback
        } catch (error) {
            return null;
        }
    }

    /**
     * Non-recursive flat list fetcher (Required for Hierarchy Import)
     */
    async listAllFilesRecursive(folderId: string): Promise<drive_v3.Schema$File[]> {
        const response = await this.drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            // 'parents' is CRITICAL here so we know what folder each file belongs to
            fields: 'files(id, name, mimeType, webViewLink, modifiedTime, size, parents)',
        });

        const items = response.data.files ?? [];
        const files: drive_v3.Schema$File[] = [];

        for (const item of items) {
            if (item.mimeType === this.FOLDER_MIME_TYPE) {
                // Recursively get files inside this subfolder
                const nestedFiles = await this.listAllFilesRecursive(item.id as string);
                // Push the folder itself (so we can save it in the DB as a folder)
                files.push(item); 
                // Push all nested files
                files.push(...nestedFiles);
            } else {
                files.push(item);
            }
        }

        return files;
    }

        async uploadFile(folderId: string, buffer: Buffer, mimeType: string, fileName: string) {
        const stream = Readable.from(buffer);
        const response = await this.drive.files.create({
            requestBody: {
                name: fileName,
                mimeType: mimeType,
                parents: [folderId],
            },
            media: {
                body: stream,
                mimeType: mimeType,
            },
            fields: 'id, webViewLink, webContentLink',
        });
        return response.data;
    }
}
