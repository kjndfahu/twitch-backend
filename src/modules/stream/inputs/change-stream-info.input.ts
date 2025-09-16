import { Field } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";

export class ChangeStreamInfoInput{
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    public title: string

    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    public categoryId: string
}