import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { WorksService } from './works.service';
import { VerificationService } from './verification.service';
import { Work, WorkConnection } from './entities/work.entity';
import {
  CreateWorkInput,
  UpdateWorkInput,
  WorkFilterInput,
  SearchWorksInput,
  VerificationInput,
} from './dto/work.dto';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { User } from '../users/entities/user.entity';

@Resolver(() => Work)
export class WorksResolver {
  constructor(
    private worksService: WorksService,
    private verificationService: VerificationService,
  ) {}

  @Query(() => WorkConnection)
  @UseGuards(GqlAuthGuard)
  async works(
    @Args('filter', { nullable: true }) filter?: WorkFilterInput,
    @Args('page', { nullable: true, defaultValue: 1 }) page?: number,
    @Args('size', { nullable: true, defaultValue: 20 }) size?: number,
  ): Promise<any> {
    return this.worksService.findAll({ ...filter, page, size });
  }

  @Query(() => Work)
  @UseGuards(GqlAuthGuard)
  async work(@Args('id') id: string): Promise<any> {
    return this.worksService.findOne(id);
  }

  @Query(() => WorkConnection)
  @UseGuards(GqlAuthGuard)
  async myWorks(
    @CurrentUser() user: User,
    @Args('page', { nullable: true, defaultValue: 1 }) page?: number,
    @Args('size', { nullable: true, defaultValue: 20 }) size?: number,
  ): Promise<any> {
    return this.worksService.findAll({ createdBy: user.id, page, size });
  }

  @Query(() => WorkConnection)
  @UseGuards(GqlAuthGuard)
  async searchWorks(
    @Args('input') input: SearchWorksInput,
    @Args('page', { nullable: true, defaultValue: 1 }) page?: number,
    @Args('size', { nullable: true, defaultValue: 20 }) size?: number,
  ): Promise<any> {
    return this.worksService.search(input.query, input.authorName, input.filters, page, size);
  }

  @Query(() => WorkConnection)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ESH)
  async pendingVerifications(
    @Args('page', { nullable: true, defaultValue: 1 }) page?: number,
    @Args('size', { nullable: true, defaultValue: 20 }) size?: number,
  ): Promise<any> {
    return this.verificationService.getPendingVerifications(page, size);
  }

  @Mutation(() => Work)
  @UseGuards(GqlAuthGuard)
  async createWork(
    @CurrentUser() user: User,
    @Args('input') input: CreateWorkInput,
  ): Promise<any> {
    return this.worksService.create(user.id, input);
  }

  @Mutation(() => Work)
  @UseGuards(GqlAuthGuard)
  async updateWork(
    @CurrentUser() user: User,
    @Args('id') id: string,
    @Args('input') input: UpdateWorkInput,
  ): Promise<any> {
    return this.worksService.update(id, user.id, user.role, input);
  }

  @Mutation(() => Work)
  @UseGuards(GqlAuthGuard)
  async deleteWork(@CurrentUser() user: User, @Args('id') id: string): Promise<any> {
    return this.worksService.delete(id, user.id, user.role);
  }

  @Mutation(() => Work)
  @UseGuards(GqlAuthGuard)
  async submitWorkForVerification(
    @CurrentUser() user: User,
    @Args('id') id: string,
  ): Promise<any> {
    return this.worksService.submitForVerification(id, user.id);
  }

  @Mutation(() => Work)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ESH)
  async approveWork(
    @CurrentUser() user: User,
    @Args('input') input: VerificationInput,
  ): Promise<any> {
    return this.verificationService.approve(input.workId, user.id, input.note);
  }

  @Mutation(() => Work)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ESH)
  async rejectWork(
    @CurrentUser() user: User,
    @Args('input') input: VerificationInput,
  ): Promise<any> {
    return this.verificationService.reject(input.workId, user.id, input.note);
  }

  @Mutation(() => Work)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ESH)
  async requestWorkChanges(
    @CurrentUser() user: User,
    @Args('input') input: VerificationInput,
  ): Promise<any> {
    return this.verificationService.requestChanges(input.workId, user.id, input.note!);
  }
}

