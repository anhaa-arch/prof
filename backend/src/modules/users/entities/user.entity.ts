import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { Department } from '../../departments/entities/department.entity';

// Register enum for GraphQL
registerEnumType(Role, {
  name: 'Role',
  description: 'User roles in the system',
});

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  fullName: string;

  @Field(() => Role)
  role: Role;

  @Field(() => String, { nullable: true })
  departmentId?: string | null;

  @Field(() => Department, { nullable: true })
  department?: Department | null;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  lastLogin?: Date | null;
}

