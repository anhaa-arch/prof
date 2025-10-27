import { InputType, Field, Int, Float } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkType, JournalIndex, WorkStatus } from '@prisma/client';

@InputType()
export class WorkAuthorInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  authorName: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  @Max(100)
  contributionPercent: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  order: number;

  @Field()
  @IsBoolean()
  isCorresponding: boolean;
}

@InputType()
export class CreateWorkInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  abstract?: string;

  @Field({ defaultValue: 'mn' })
  @IsString()
  language: string;

  @Field(() => String)
  @IsEnum(WorkType)
  type: WorkType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  journalName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(JournalIndex)
  journalIndex?: JournalIndex;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  doi?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  issn?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  volume?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  issue?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  pages?: string;

  @Field(() => Int)
  @IsInt()
  @Min(1900)
  year: number;

  @Field({ nullable: true })
  @IsOptional()
  publishedDate?: Date;

  @Field(() => [WorkAuthorInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkAuthorInput)
  authors: WorkAuthorInput[];
}

@InputType()
export class UpdateWorkInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  abstract?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  language?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(WorkType)
  type?: WorkType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  journalName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(JournalIndex)
  journalIndex?: JournalIndex;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  doi?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  issn?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  volume?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  issue?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  pages?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  year?: number;

  @Field({ nullable: true })
  @IsOptional()
  publishedDate?: Date;
}

@InputType()
export class WorkFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(WorkStatus)
  status?: WorkStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(WorkType)
  type?: WorkType;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(JournalIndex)
  journalIndex?: JournalIndex;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  year?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}

@InputType()
export class SearchFiltersInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(WorkType)
  type?: WorkType;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(JournalIndex)
  journalIndex?: JournalIndex;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  yearFrom?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  yearTo?: number;
}

@InputType()
export class SearchWorksInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  query: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  authorName?: string;

  @Field(() => SearchFiltersInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => SearchFiltersInput)
  filters?: SearchFiltersInput;
}

@InputType()
export class VerificationInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  workId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  note?: string;
}

