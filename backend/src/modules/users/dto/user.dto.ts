import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  password: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @Field(() => String)
  @IsEnum(Role)
  role: Role;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  departmentId?: string;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fullName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class UserFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}

