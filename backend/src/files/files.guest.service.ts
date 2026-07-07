import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DriveService } from '../drive/drive.service';

@Injectable()
export class FilesGuestService {
    constructor(
        private prisma: PrismaService,
        private driveService: DriveService
    ){}

    /**
     * Guest Access: View files for a SPECIFIC product only.
     * No search across the whole site. Only return PUBLIC files.
     */
    async getProductFilesForGuest(productId: string) {
        const product = await this.prisma.product.findUnique({ where: { id: productId }});
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const files = await this.prisma.file.findMany({
            where: {
                productId: productId,
                deletedAt: null,
                visibility: 'PUBLIC' // GUESTS CAN ONLY SEE PUBLIC FILES
            },
            include: {
                category: true,
                fileTags: { include: { tag: true } },
            },
            orderBy: { name: 'asc' } // Folders first, then files (alphabetical)
        });

        // Enrich with preview URLs
        const enrichedFiles = await Promise.all(files.map(async (file) => {
            const previewUrl = await this.driveService.getNativePreviewUrl(file.driveFileId);
            return { ...file, previewUrl };
        }));

        return { product, files: enrichedFiles };
    }

    /**
     * Guest Access: Search ONLY within a specific product.
     */
    async searchProductFilesForGuest(productId: string, query: string) {
        if (!query) return this.getProductFilesForGuest(productId);

        const product = await this.prisma.product.findUnique({ where: { id: productId }});
        if (!product) throw new NotFoundException('Product not found');

        const files = await this.prisma.file.findMany({
            where: {
                productId: productId,
                deletedAt: null,
                visibility: 'PUBLIC',
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { title: { contains: query, mode: 'insensitive' } },
                ]
            },
            include: { category: true, fileTags: { include: { tag: true } } },
            orderBy: { name: 'asc' }
        });

        const enrichedFiles = await Promise.all(files.map(async (file) => {
            const previewUrl = await this.driveService.getNativePreviewUrl(file.driveFileId);
            return { ...file, previewUrl };
        }));

        return { product, files: enrichedFiles };
    }
}