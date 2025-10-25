import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt } from 'class-validator';

@InputType()
export class ReportFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  year?: number;
}

