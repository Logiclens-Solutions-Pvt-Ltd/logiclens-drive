import { Controller, Get, Query, Param } from '@nestjs/common';
import { FilesGuestService } from './files.guest.service';

@Controller('guest') // Dedicated route for guests
export class FilesGuestController {
    constructor(private readonly guestService: FilesGuestService) {}

    // GET /guest/:productId/files
    @Get(':productId/files')
    getProductFiles(@Param('productId') productId: string) {
        return this.guestService.getProductFilesForGuest(productId);
    }

    // GET /guest/:productId/search?query=...
    @Get(':productId/search')
    searchFiles(
        @Param('productId') productId: string,
        @Query('query') query?: string,
    ) {
        return this.guestService.searchProductFilesForGuest(productId, query);
    }
}