import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class Department {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  code: string;

  @Field(() => String, { nullable: true })
  headUserId?: string | null;

  @Field(() => User, { nullable: true })
  head?: User | null;

  @Field(() => [User], { nullable: true })
  users?: User[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

