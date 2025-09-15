import { PrismaService } from '@/src/core/prisma/prisma.service';
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginInput } from './inputs/login.input';
import { verify } from 'argon2';
import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util';
import { RedisService } from '@/src/core/redis/redis.service';
import { destroySession, saveSession } from '@/src/shared/utils/session.util';
import { VereficationService } from '../verefication/verefication.service';
import { TOTP } from 'otpauth';

@Injectable()
export class SessionService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService,
		private readonly configService: ConfigService,
		private readonly vereficationService: VereficationService
	){}

	public async findByUser(req: Request){
		const userId = req.session.userId

		if(!userId){
			throw new NotFoundException('Пользователь не обнаружен в сессии')
		}

		const keys = await this.redisService.keys('*')

		type StoredSession = {
			id: string
			userId: string
			createdAt: number | string | Date
			[key: string]: any
		}

		const userSessions: StoredSession[] = []

		for(const key of keys){
			const sessionData = await this.redisService.get(key)

			if(sessionData){
				const parsed = JSON.parse(sessionData as string) as Record<string, any>

				if(parsed.userId === userId){
					const item: StoredSession = {
						id: key.split(':')[1],
						userId: parsed.userId,
						createdAt: parsed.createdAt,
						...parsed
					}
					userSessions.push(item)
				}
			}
		}

		userSessions.sort((a, b) => {
			const aTime = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime()
			const bTime = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime()
			return bTime - aTime
		})

		return userSessions.filter(session => session.id !== req.session.id)
	}

	public async findCurrent(req: Request){
		const sessionId = req.session.id

		const sessionData = await this.redisService.get(`${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`)

		const session = sessionData ? JSON.parse(sessionData) : {}

		return {
			...session,
			id: sessionId
		}
	}

	public async login(req: Request ,input: LoginInput, userAgent: string){
		const {login, password, pin} = input

		const user = await this.prismaService.user.findFirst({
			where: {
				OR: [
					{username:{equals: login}},
					{email:{equals: login}}
				]
			}
		})

		if(!user){
			throw new NotFoundException('Пользователь не найден')
		}

		const isValidPassword = await verify(user.password, password)

		if(!isValidPassword){
			throw new UnauthorizedException('Неверный пароль')
		}

		if(!user.isEmailVerified){
			await this.vereficationService.sendVereficationToken(user)

			throw new BadRequestException('Аккаунт не верифицирован. Пожалуйста проверьте свою почту для подтверждения')
		}

		if(user.isTotpEnabled){
			if(!pin){
				return {
					user: null,
					message: 'Необходим код для завершения авторизации'
				}
			}

			if(!user.totpSecret){
				throw new InternalServerErrorException('TOTP секрет не настроен')
			}

			const totp = new TOTP({
			issuer: 'TeaStream',
			label: `${user.email}`,
			algorithm: 'SHA1',
			digits: 6,
			secret: user.totpSecret
		})

		const delta = totp.validate({token: pin})

		if(delta === null){
			throw new BadRequestException('Неверный код')
		}
		}

		const metadata = getSessionMetadata(req, userAgent)

		const savedUser = await saveSession(req, user, metadata)

		return {
			user: savedUser,
			message: null
		}
	}

	public async logout(req: Request){
		return destroySession(req, this.configService)
	}

	public async clearSession(req: Request){
		req.res?.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'))

		return true
	}

	public async remove(req: Request, id: string){
		if(req.session.id === id){
			throw new ConflictException('тЕкущую сессию удалить нельзя')
		}

		await this.redisService.del(`${this.configService.getOrThrow<string>('SESSION_FOLDER')}${id}`)

		return true
	}
}
