import type { SocialLink, Stream, User } from '@/prisma/generated'
import { Field, ID, ObjectType } from '@nestjs/graphql'
import { UserModel } from '../../auth/account/models/user.model'

@ObjectType()
export class StreamModel implements Stream {
    @Field(() => ID)
    id: string

    @Field(() => String)
    public title: string

    @Field(() => String, {nullable: true})
    public thumnailUrl: string

    @Field(() => String, {nullable: true})
    public ingressId: string

    @Field(() => String, {nullable: true})
    public serverUrl: string

    @Field(() => String, {nullable: true})
    public streamKey: string

    @Field(() => Boolean)
    public isLive: boolean

    @Field(() => UserModel)
    public user: UserModel

    @Field(() => String)
    public userId: string

    @Field(() => Date)
    createdAt: Date

    @Field(() => Date)
    updatedAt: Date
}
