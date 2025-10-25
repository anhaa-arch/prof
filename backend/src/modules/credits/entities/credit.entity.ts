import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { User } from '../../users/entities/user.entity';
import { Work } from '../../works/entities/work.entity';

@ObjectType()
export class Credit {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  workId: string;

  @Field(() => Float)
  creditValue: number | any; // Allow Prisma Decimal

  @Field()
  calculatedAt: Date;

  @Field(() => GraphQLJSONObject, { nullable: true })
  calculationDetail?: any;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => Work, { nullable: true })
  work?: Work;
}

@ObjectType()
export class CreditConnection {
  @Field(() => [Credit])
  data: Credit[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  size: number;

  @Field(() => Int)
  totalPages: number;
}

@ObjectType()
export class CreditBreakdown {
  @Field(() => Float)
  totalCredits: number;

  @Field(() => GraphQLJSONObject)
  byType: Record<string, number>;

  @Field(() => GraphQLJSONObject)
  byIndex: Record<string, number>;

  @Field(() => GraphQLJSONObject)
  byYear: Record<number, number>;

  @Field(() => [Credit])
  credits: Credit[];
}

