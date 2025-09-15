import { Module } from '@nestjs/common'

import { AccountResolver } from './account.resolver'
import { AccountService } from './account.service'
import { VereficationService } from '../verefication/verefication.service'

@Module({
	providers: [AccountResolver, AccountService, VereficationService]
})
export class AccountModule {}
