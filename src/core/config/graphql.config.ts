import { ApolloDriverConfig } from '@nestjs/apollo'
import { ConfigService } from '@nestjs/config'
import { join } from 'path'

import { isDev } from '@/src/shared/utils/is-dev.util'

export function getGraphQlConfig(
	configService: ConfigService
): ApolloDriverConfig {
	return {
		// playground: isDev(configService),
		playground: true,
		path: configService.getOrThrow<string>('GRAPHQL_PREFIX'),
		autoSchemaFile: join(process.cwd(), 'src/core/graphql/schema.gql'),
		sortSchema: true,
		// Disable CSRF in development to allow opening /graphql directly
		// csrfPrevention: !isDev(configService),
		csrfPrevention: false,
		context: ({ req, res }) => ({ req, res })
	}
}
