import { Controller, Get, Query } from '@nestjs/common';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService){}

    @Get('search')
    search(
        @Query('query') query?: string,
        @Query('category') category?: string,
        @Query('tag') tag?: string,
        @Query('productId') productId?: string,
    ){
        return this.filesService.search({query, category, tag, productId });
    }
}
