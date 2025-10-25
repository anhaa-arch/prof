import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput, UpdateUserInput, UserFilterInput } from './dto/user.dto';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => [User])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ESH)
  async users(@Args('filter', { nullable: true }) filter?: UserFilterInput): Promise<any> {
    return this.usersService.findAll(filter);
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async user(@Args('id') id: string): Promise<any> {
    return this.usersService.findOne(id);
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: User): Promise<any> {
    return this.usersService.findOne(user.id);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createUser(@Args('input') input: CreateUserInput): Promise<any> {
    return this.usersService.create(input);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateUser(
    @Args('id') id: string,
    @Args('input') input: UpdateUserInput,
  ): Promise<any> {
    return this.usersService.update(id, input);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateMyProfile(
    @CurrentUser() user: User,
    @Args('input') input: UpdateUserInput,
  ): Promise<any> {
    // Users can only update their own profile (limited fields)
    return this.usersService.update(user.id, {
      fullName: input.fullName,
    });
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteUser(@Args('id') id: string): Promise<any> {
    return this.usersService.delete(id);
  }
}

