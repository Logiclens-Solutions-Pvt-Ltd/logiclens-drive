import {PrismaClient} from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';


const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string});
const prisma = new PrismaClient({ adapter });

async function main(){
    const category = await prisma.category.create({data: {name: 'Marketing'}});
    const tag = await prisma.tag.create({ data: {name: 'urgent'}});

    console.log({category, tag});
}

main().finally(() => prisma.$disconnect());