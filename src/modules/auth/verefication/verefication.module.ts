import { Module } from '@nestjs/common';
import { VereficationService } from './verefication.service';
import { VereficationResolver } from './verefication.resolver';
import { MailModule } from '@/src/modules/libs/mail/mail.module';

@Module({
  imports: [MailModule],
  providers: [VereficationResolver, VereficationService],
})
export class VereficationModule {}
