import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { createHash } from 'crypto';

const SALT_ROUNDS = 10;


@Injectable()
export class AuthService {

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ){}

    async register(dto: RegisterDto){
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email }});

        if(existing){
            throw new ConflictException('An account with this email already exists');
        }

        const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
        
        const user = await this.prisma.user.create({
            data: {email: dto.email, passwordHash},
        });


        return this.issueTokens(user.id, user.email, user.role);
    }

    async login(dto: LoginDto){
        const user = await this.prisma.user.findUnique({ where: { email: dto.email }});

        if(!user){
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
        if(!passwordMatches){
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.issueTokens(user.id, user.email, user.role);
    }

    async refresh(refreshToken: string){
        let payload: {sub: string; email: string; role: string};

        try{
            payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // const storedTokens = await this.prisma.refreshToken.findMany({
        //     where: {userId: payload.sub, revoked: false},
        // });

        // let matchedTokenId: string | null = null;
        
        // for(const stored of storedTokens ){
        //     const isMatch = await bcrypt.compare(refreshToken, stored.tokenHash);
        //     if(isMatch){
        //         matchedTokenId = stored.id;
        //         break;
        //     }
        // }
        // console.log('payload.sub:', payload.sub);
        // console.log('storedTokens found:', storedTokens.length);
        // console.log('matchedTokenId:', matchedTokenId);
        // if(!matchedTokenId){
        //     throw new UnauthorizedException('Refresh token not recognized');
        // }

        // await this.prisma.refreshToken.update({
        //     where: { id: matchedTokenId },
        //     data: { revoked: true},
        // });

        const tokenHash = this.hashToken(refreshToken);
        const stored = await this.prisma.refreshToken.findUnique({
            where: {tokenHash},
        });

        if(!stored || stored.revoked || stored.userId !== payload.sub){
            throw new UnauthorizedException('Refresh Token not recognized');
        }

        await this.prisma.refreshToken.update({
            where: { id: stored.id},
            data: { revoked: true }
        })

        return this.issueTokens(payload.sub, payload.email, payload.role);
    }

    async logout(refreshToken: string){
        let payload: { sub: string };

        try{
            payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });
        } catch {
            return { message: 'Logged out' };
        }

        // const storedTokens = await this.prisma.refreshToken.findMany({
        //     where: {userId: payload.sub, revoked: false },
        // });

        // for(const stored of storedTokens){
        //     const isMatch = await bcrypt.compare(refreshToken, stored.tokenHash);
        //     if(isMatch){
        //         await this.prisma.refreshToken.update({
        //             where: { id: stored.id},
        //             data: {revoked: true},
        //         });
        //         break;
        //     }
        // }

        const tokenHash = this.hashToken(refreshToken);
        const stored = await this.prisma.refreshToken.findFirst({
            where: { tokenHash, revoked: false},
        });

        if(stored){
            await this.prisma.refreshToken.update({
                where: {id: stored.id},
                data: {revoked: true}
            });
        }

        return {message: 'Logged out'};
    }

    private hashToken(token: string): string{
        return createHash('sha256').update(token).digest('hex');
    }
    private async issueTokens(userId: string, email: string, role: string){
        const payload = { sub: userId, email, role};

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_SECRET'),
            expiresIn: '15m',
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
        });

        // const tokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
        const tokenHash = this.hashToken(refreshToken);

        await this.prisma.refreshToken.create({
            data: {
                tokenHash,
                userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        return {accessToken, refreshToken};


    }
}
