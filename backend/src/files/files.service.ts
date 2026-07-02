import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FilesService {
    constructor(private prisma: PrismaService){}

    search(params: {query?: string; category? : string; tag? : string; productId?: string}){
        const { query, category, tag, productId } = params;

        return this.prisma.file.findMany({
            where: {
                AND: [
                    query? { name: {contains: query, mode: 'insensitive'}}: {},
                    category? {category: {name : {equals: category, mode: 'insensitive'}}} : {},
                    tag ? {fileTags: { some: {tag: {name: {equals: tag, mode: 'insensitive'}}}}} : {},
                    productId ? { productId } : {},
                ],
            },
            include: {
                category: true,
                fileTags: {include: {tag: true}},
                product: {select: {id: true, name: true}},
            },
            orderBy: {modifiedTime: 'desc'},
        });
    }
}
