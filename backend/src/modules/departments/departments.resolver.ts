import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { Department } from './entities/department.entity';
import { CreateDepartmentInput, UpdateDepartmentInput } from './dto/department.dto';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Resolver(() => Department)
export class DepartmentsResolver {
  constructor(private departmentsService: DepartmentsService) {}

  @Query(() => [Department])
  @UseGuards(GqlAuthGuard)
  async departments(): Promise<any> {
    return this.departmentsService.findAll();
  }

  @Query(() => Department)
  @UseGuards(GqlAuthGuard)
  async department(@Args('id') id: string): Promise<any> {
    return this.departmentsService.findOne(id);
  }

  @Mutation(() => Department)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createDepartment(@Args('input') input: CreateDepartmentInput): Promise<any> {
    return this.departmentsService.create(input);
  }

  @Mutation(() => Department)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateDepartment(
    @Args('id') id: string,
    @Args('input') input: UpdateDepartmentInput,
  ): Promise<any> {
    return this.departmentsService.update(id, input);
  }

  @Mutation(() => Department)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteDepartment(@Args('id') id: string): Promise<any> {
    return this.departmentsService.delete(id);
  }
}

