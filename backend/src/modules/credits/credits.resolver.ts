import { Resolver, Query, Mutation, Args, Int, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { Credit, CreditConnection, CreditBreakdown } from './entities/credit.entity';
import { CreditFilterInput } from './dto/credit.dto';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { User } from '../users/entities/user.entity';

@Resolver(() => Credit)
export class CreditsResolver {
  constructor(private creditsService: CreditsService) {}

  @Query(() => CreditConnection)
  @UseGuards(GqlAuthGuard)
  async credits(
    @Args('filter', { nullable: true }) filter?: CreditFilterInput,
    @Args('page', { nullable: true, defaultValue: 1 }) page?: number,
    @Args('size', { nullable: true, defaultValue: 50 }) size?: number,
  ): Promise<any> {
    return this.creditsService.findAll({ ...filter, page, size });
  }

  @Query(() => Credit)
  @UseGuards(GqlAuthGuard)
  async credit(@Args('id') id: string): Promise<any> {
    return this.creditsService.findOne(id);
  }

  @Query(() => CreditConnection)
  @UseGuards(GqlAuthGuard)
  async myCredits(
    @CurrentUser() user: User,
    @Args('year', { type: () => Int, nullable: true }) year?: number,
    @Args('page', { nullable: true, defaultValue: 1 }) page?: number,
    @Args('size', { nullable: true, defaultValue: 50 }) size?: number,
  ): Promise<any> {
    return this.creditsService.findAll({ userId: user.id, year, page, size });
  }

  @Query(() => Float)
  @UseGuards(GqlAuthGuard)
  async myTotalCredits(
    @CurrentUser() user: User,
    @Args('year', { type: () => Int, nullable: true }) year?: number,
  ): Promise<number> {
    return this.creditsService.getUserTotalCredits(user.id, year);
  }

  @Query(() => CreditBreakdown)
  @UseGuards(GqlAuthGuard)
  async myCreditsBreakdown(
    @CurrentUser() user: User,
    @Args('year', { type: () => Int, nullable: true }) year?: number,
  ): Promise<CreditBreakdown> {
    return this.creditsService.getUserCreditsBreakdown(user.id, year);
  }

  @Query(() => Float)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ESH)
  async userTotalCredits(
    @Args('userId') userId: string,
    @Args('year', { type: () => Int, nullable: true }) year?: number,
  ): Promise<number> {
    return this.creditsService.getUserTotalCredits(userId, year);
  }

  @Mutation(() => [Credit])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ESH)
  async calculateCreditsForWork(@Args('workId') workId: string): Promise<any> {
    return this.creditsService.calculateCreditsForWork(workId);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async recalculateAllCredits(): Promise<boolean> {
    const result = await this.creditsService.recalculateAllCredits();
    return result.success;
  }
}

