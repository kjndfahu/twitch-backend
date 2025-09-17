import { ApolloDriver } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'

import { AccountModule } from '../modules/auth/account/account.module'
import { IS_DEV_ENV } from '../shared/utils/is-dev.util'

import { getGraphQlConfig } from './config/graphql.config'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'
import { SessionModule } from '../modules/auth/session/session.module'
import { VereficationModule } from '../modules/auth/verefication/verefication.module'
import { MailModule } from '../modules/libs/mail/mail.module'
import { PasswordRecoveryModule } from '../modules/auth/password-recovery/password-recovery.module'
import { TotpModule } from '../modules/auth/totp/totp/totp.module'
import { DeactivateModule } from '../modules/auth/deactivate/deactivate.module'
import { CronModule } from '../modules/cron/cron.module'
import { StorageModule } from '../modules/libs/storage/storage.module'
import { ProfileModule } from '../modules/auth/profile/profile.module'
import { StreamModule } from '../modules/stream/stream.module'
import { LivekitModule } from '../modules/libs/livekit/livekit.module'
import { getLiveKitConfig } from './config/livekit.config'

@Module({
	imports: [
		ConfigModule.forRoot({
			ignoreEnvFile: !IS_DEV_ENV,
			isGlobal: true
		}),
		GraphQLModule.forRootAsync({
			driver: ApolloDriver,
			imports: [ConfigModule],
			useFactory: getGraphQlConfig,
			inject: [ConfigService]
		}),
		LivekitModule.registerAsync({
			imports: [ConfigModule],
			useFactory: getLiveKitConfig,
			inject: [ConfigService]
		}),
		PrismaModule,
		RedisModule,
		MailModule,
		AccountModule,
		SessionModule,
		VereficationModule,
		PasswordRecoveryModule,
		TotpModule,
		CronModule,
		StorageModule,
		ProfileModule,
		DeactivateModule,
		StreamModule,
		LivekitModule
	]
})
export class CoreModule {}
