import { Field, InputType } from '@nestjs/graphql'
import {
	IsNotEmpty,
	IsNumber,
	IsString,
} from 'class-validator'

@InputType()
export class SocialLinkInput{
	@Field(() => String)
	@IsNotEmpty()
	@IsString()
	public title: string

	@Field(() => String)
	@IsNotEmpty()
	@IsString()
	public url: string
}

@InputType()
export class SocialLinkOrderInput{
	@Field(() => String)
	@IsNotEmpty()
	@IsString()
	public id: string

	@Field(() => Number)
	@IsNumber()
	@IsString()
	public position: number
}