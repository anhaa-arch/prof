import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class AnnualReport {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field(() => Int)
  year: number;

  @Field(() => Float)
  totalCredits: number | any; // Allow Prisma Decimal

  @Field(() => Float)
  teachingCredits: number | any; // Allow Prisma Decimal

  @Field(() => Float)
  researchCredits: number | any; // Allow Prisma Decimal

  @Field(() => Float)
  serviceCredits: number | any; // Allow Prisma Decimal

  @Field()
  generatedAt: Date;

  @Field(() => GraphQLJSONObject, { nullable: true })
  reportData?: any;

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
export class AnnualReportConnection {
  @Field(() => [AnnualReport])
  data: AnnualReport[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  size: number;

  @Field(() => Int)
  totalPages: number;
}

