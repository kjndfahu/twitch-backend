import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { VereficationService } from './verefication.service';
import type { GqlContext } from '@/src/shared/types/gql-context.types';
import { VereficationInput } from './inputs/verefication.input';
import { UserAgent } from '@/src/shared/decorators/user-agent.decorator';
import { UserModel } from '../account/models/user.model';

@Resolver('Verefication')
export class VereficationResolver {
  public constructor(private readonly vereficationService: VereficationService) {}

  @Mutation(() => UserModel, {name: 'verifyAccount'})
  public async verify(
    @Context() {req}: GqlContext,
    @Args('data') input: VereficationInput,
    @UserAgent() userAgent: string
  ) {
    return this.vereficationService.verify(req, input, userAgent)
  }
}
