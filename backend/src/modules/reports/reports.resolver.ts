import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AnnualReport, AnnualReportConnection } from './entities/report.entity';
import { ReportFilterInput } from './dto/report.dto';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { User } from '../users/entities/user.entity';

@Resolver(() => AnnualReport)
export class ReportsResolver {
  constructor(private reportsService: ReportsService) {}

  @Query(() => AnnualReportConnection)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ESH)
  async annualReports(
    @Args('filter', { nullable: true }) filter?: ReportFilterInput,
    @Args('page', { nullable: true, defaultValue: 1 }) page?: number,
    @Args('size', { nullable: true, defaultValue: 20 }) size?: number,
  ): Promise<any> {
    return this.reportsService.findAll({ ...filter, page, size });
  }

  @Query(() => AnnualReport)
  @UseGuards(GqlAuthGuard)
  async annualReport(@Args('id') id: string): Promise<any> {
    return this.reportsService.findOne(id);
  }

  @Query(() => AnnualReport, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async myAnnualReport(
    @CurrentUser() user: User,
    @Args('year', { type: () => Int }) year: number,
  ): Promise<any> {
    return this.reportsService.findByUserAndYear(user.id, year);
  }

  @Query(() => AnnualReport, { nullable: true })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ESH)
  async userAnnualReport(
    @Args('userId') userId: string,
    @Args('year', { type: () => Int }) year: number,
  ): Promise<any> {
    return this.reportsService.findByUserAndYear(userId, year);
  }

  @Mutation(() => AnnualReport)
  @UseGuards(GqlAuthGuard)
  async generateMyAnnualReport(
    @CurrentUser() user: User,
    @Args('year', { type: () => Int }) year: number,
  ): Promise<any> {
    return this.reportsService.generateAnnualReport(user.id, year);
  }

  @Mutation(() => AnnualReport)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ESH)
  async generateAnnualReport(
    @Args('userId') userId: string,
    @Args('year', { type: () => Int }) year: number,
  ): Promise<any> {
    return this.reportsService.generateAnnualReport(userId, year);
  }

  @Mutation(() => AnnualReport)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteAnnualReport(@Args('id') id: string): Promise<any> {
    return this.reportsService.delete(id);
  }
}

