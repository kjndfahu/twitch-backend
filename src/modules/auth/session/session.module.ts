import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionResolver } from './session.resolver';
import { VereficationService } from '../verefication/verefication.service';

@Module({
  providers: [SessionResolver, SessionService, VereficationService],
})
export class SessionModule {}
