import { PrismaService } from '@/src/core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { FiltersInput } from './inputs/filters.input';
import type { Prisma, User } from '@/prisma/generated';
import { ChangeStreamInfoInput } from './inputs/change-stream-info.input';
import sharp from 'sharp'
import * as Upload from 'graphql-upload/Upload.js'
import { StorageService } from '../libs/storage/storage.service';

@Injectable()
export class StreamService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly storageService: StorageService
    ){}

    public async findRandom(){
        const total = await this.prismaService.stream.count({
            where: {
                user: {
                    isDeactivated: false
                }
            }
        })

        const randomIndexes = new Set<number>()

        while(randomIndexes.size < 4){
            const randomIndex = Math.floor(Math.random() * total)

            randomIndexes.add(randomIndex)
        }

        const streams = await this.prismaService.stream.findMany({
            where: {
                user: {
                    isDeactivated: false
                }
            },
            include: {
                user: true
            },
            take: total,
            skip: 0
        })
        
        return Array.from(randomIndexes).map(index => streams[index])
    }

    public async findAll(input: FiltersInput = {}){
        const {take, skip, searchTerm} = input;

        const whereClause = searchTerm ? this.findBySearchTermFilter(searchTerm) : undefined


        const streams = await this.prismaService.stream.findMany({
            take: take ?? 12,
            skip: skip ?? 0,
            where: {
                user: {
                    isDeactivated: false
                },
                ...whereClause
            },
            include: {
                user: true
            },
            orderBy:{
                createdAt: 'desc'
            }
        })

        return streams
    }

    public async changeInfo(user: User, input: ChangeStreamInfoInput){
        const {title, categoryId} = input

        await this.prismaService.stream.update({
            where: {
                userId: user.id
            },
            data: {
                title
            }
        })

        return true
    }

    public async changeThumbnail(user: User, file: Upload){
        const stream = await this.findByUserId(user)

            if(stream?.thumnailUrl){
                await this.storageService.remove(stream.thumnailUrl)
            }
    
            const chunks: Buffer[] = []
    
            for await (const chunk of file.createReadStream()){
                chunks.push(chunk)
            }
    
            const buffer = Buffer.concat(chunks)
    
            const fileName = `/streams/${user.username}.webp`
    
            if(file.filename && file.filename.endWith('.gif')){
                const processedBuffer = await sharp(buffer, {animated: true}).resize(1280, 720).webp().toBuffer()
    
                await this.storageService.upload(processedBuffer, fileName, 'image/webp')
            } else {
                const processedBuffer = await sharp(buffer).resize(1280, 720).webp().toBuffer()
    
                await this.storageService.upload(processedBuffer, fileName, 'image/webp')
            }
    
            await this.prismaService.stream.update({
                where: {
                    userId: user.id
                },
                data: {
                    thumnailUrl: fileName
                }
            })
    
            return true
        }
    
        public async removeThumbnail(user: User){
            const stream = this.findByUserId(user)

            if(!stream?.thumnailUrl){
                return
            }
    
            await this.storageService.remove(stream.thumnailUrl)
    
            await this.prismaService.stream.update({
                where: {
                    userId: user.id
                },
                data: {
                    thumnailUrl: null
                }
            })
    
            return true
        }

    private async findByUserId(user: User){
        const stream = await this.prismaService.stream.findUnique({
            where: {
                userId: user.id
            }
        })

        return stream
    }

    private findBySearchTermFilter(
        searchTerm: string
    ): Prisma.StreamWhereInput{
        return {
            OR: [
                {
                    title: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                },
                {
                    user: {
                        username: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    }
                }
            ]
        }
    }
}
