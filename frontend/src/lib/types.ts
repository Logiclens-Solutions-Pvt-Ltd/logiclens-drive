export interface Product {
    id: string;
    name: string;
    description: string | null;
    driveFolderId: string;
    driveFolderLink: string;
    createdAt: string;
    updatedAt: string;
}

// --- ADD THIS EXACT INTERFACE ---
// This matches exactly what your /products/:id/files endpoint returns
export interface FileItem {
    id: string;
    driveFileId: string;
    name: string;
    mimeType: string;
    webViewLink: string;
    size: BigInt | null;
    modifiedTime: string;
    title: string | null;
    description: string | null;
    remarks: string | null;
    visibility: 'PUBLIC' | 'PRIVATE';
    productId: string;
    categoryId: string | null;
    category: { id: string; name: string } | null;
    fileTags: { tag: { id: string; name: string } }[];
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    parentId: string | null;
    driveRole: string | null;
    isFolder: boolean;
}