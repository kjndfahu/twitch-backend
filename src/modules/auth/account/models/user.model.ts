import type { SocialLink, User } from '@/prisma/generated'
import { Field, ID, ObjectType } from '@nestjs/graphql'
import { SocialLinkModel } from '../../profile/models/social-link.model'
import { StreamModel } from '@/src/modules/stream/models/stream.model'

@ObjectType()
export class UserModel implements User {
	@Field(() => ID)
	id: string

	@Field(() => String)
	email: string

	@Field(() => String)
	password: string

	@Field(() => String)
	username: string

	@Field(() => String)
	displayName: string

	@Field(() => String, { nullable: true })
	avatar: string | null

	@Field(() => String, { nullable: true })
	bio: string | null

	@Field(() => Boolean)
	isVerified: boolean

	@Field(() => Boolean)
	isEmailVerified: boolean

	@Field(() => Boolean)
	isTotpEnabled: boolean

	@Field(() => String, {nullable: true})
	totpSecret: string

	@Field(() => Boolean)
	isDeactivated: boolean

	@Field(() => Date, {nullable: true})
	deactivatedAt: Date

	@Field(() => [SocialLinkModel])
	public socialLinks: SocialLinkModel[]

	@Field(() => StreamModel)
	public stream: StreamModel

	@Field(() => Date)
	createdAt: Date

	@Field(() => Date)
	updatedAt: Date
}
