import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decoraters/roles.decorater';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Express } from 'express'; 
import multer from 'multer';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createProductDto: CreateProductDto){
        return this.productsService.create(createProductDto);
    }

    @Get()
    findAll(){
        return this.productsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string){
        return this.productsService.findOne(id);
    }

    @Get(':id/thumbnail')
    async getThumbnail(@Param('id') id: string) {
        return this.productsService.getProductThumbnail(id);
    }

    @Get(':id/files')
    async findFiles(
        @Param('id') id: string, 
        @Query('parentId') parentId?: string // ADDED THIS
    ){
        return this.productsService.findFiles(id, parentId);
    }
    
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto){
        return this.productsService.update(id, updateProductDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string){
        return this.productsService.remove(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/sync')
    syncFiles(@Param('id') id: string){
        return this.productsService.syncFiles(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN') // ONLY ADMINS CAN RUN HIERARCHY SYNC
    @Post(':id/sync-hierarchy')
    syncHierarchy(@Param('id') id: string) {
        return this.productsService.syncHierarchy(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/upload')
    @UseInterceptors(FilesInterceptor('files'))
    async uploadFiles(
        @Param('id') id: string,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        const filesArray = Array.isArray(files) ? files : [files];
        return this.productsService.uploadFilesToProduct(id, filesArray);
    }
}
