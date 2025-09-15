import {
	Injectable,
	type OnModuleDestroy,
	type OnModuleInit
} from '@nestjs/common'
import { PrismaClient } from '@prisma/generated'

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	public async onModuleInit() {
		await this.$connect()
	} // - метод вызывается при инициализации модуля, в нем устанавливается коннекст с бд

	public async onModuleDestroy() {
		await this.$disconnect()
	}
}
