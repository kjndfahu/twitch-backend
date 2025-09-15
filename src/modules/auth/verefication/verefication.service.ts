import { PrismaService } from '@/src/core/prisma/prisma.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MailService } from '../../libs/mail/mail.service';
import { Request } from 'express';
import { VereficationInput } from './inputs/verefication.input';
import { TokenType, User } from '@/prisma/generated';
import { exec } from 'child_process';
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util';
import { saveSession } from '@/src/shared/utils/session.util';
import { generateToken } from '@/src/shared/utils/generate-token.util';

@Injectable()
export class VereficationService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly mailService: MailService
	) {}

	public async verify(
		req: Request,
		input: VereficationInput,
		userAgent: string
	){
		const {token} = input

		const existingToken = await this.prismaService.token.findUnique({
			where: {
				token,
				type: TokenType.EMAIL_VERIFY
			}
		})

		if(!existingToken){
			throw new NotFoundException("Токен не найден")
		}

		const hasExpired = new Date(existingToken.expiresIn) < new Date()

		if(hasExpired){
			throw new BadRequestException('Токен истек')
		}

		const user = await this.prismaService.user.update({
			where: {
				id: existingToken.userId || undefined
			},
			data: {
				isEmailVerified: true
			}
		})

		await this.prismaService.token.delete({
			where:{
				id: existingToken.id,
				type: TokenType.EMAIL_VERIFY
			}
		})

		const metadata = getSessionMetadata(req, userAgent)

		return saveSession(req, user, metadata)
	}

	public async sendVereficationToken(user: User){
		const vereficationToken = await generateToken(
			this.prismaService,
			user,
			TokenType.EMAIL_VERIFY
		)

		await this.mailService.sendVereficationToken(
			user.email,
			vereficationToken.token
		)

		return true
	}
}
