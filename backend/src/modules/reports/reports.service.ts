import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnnualReport, Prisma } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateAnnualReport(userId: string, year: number): Promise<AnnualReport> {
    // Check if report already exists
    const existing = await this.prisma.annualReport.findUnique({
      where: {
        userId_year: {
          userId,
          year,
        },
      },
    });

    // Delete if exists to regenerate
    if (existing) {
      await this.prisma.annualReport.delete({
        where: { id: existing.id },
      });
    }

    // Get all credits for the user in the specified year
    const credits = await this.prisma.credit.findMany({
      where: {
        userId,
        work: {
          year,
        },
      },
      include: {
        work: {
          include: {
            authors: true,
          },
        },
      },
    });

    // Calculate totals
    let totalCredits = 0;
    let researchCredits = 0;
    let teachingCredits = 0;
    let serviceCredits = 0;

    const worksByType: Record<string, any[]> = {};
    const worksByIndex: Record<string, any[]> = {};

    for (const credit of credits) {
      const creditValue = Number(credit.creditValue);
      totalCredits += creditValue;

      // Categorize by work type (for now, all to research)
      if (credit.work.type === 'TEACHING_MATERIAL') {
        teachingCredits += creditValue;
      } else {
        researchCredits += creditValue;
      }

      // Group by type
      const type = credit.work.type;
      if (!worksByType[type]) {
        worksByType[type] = [];
      }
      worksByType[type].push({
        workId: credit.work.id,
        title: credit.work.title,
        credit: creditValue,
        journalIndex: credit.work.journalIndex,
      });

      // Group by index
      const index = credit.work.journalIndex || 'NONE';
      if (!worksByIndex[index]) {
        worksByIndex[index] = [];
      }
      worksByIndex[index].push({
        workId: credit.work.id,
        title: credit.work.title,
        credit: creditValue,
      });
    }

    // Create report data
    const reportData = {
      year,
      userId,
      generatedAt: new Date().toISOString(),
      totalWorks: credits.length,
      credits: {
        total: totalCredits,
        research: researchCredits,
        teaching: teachingCredits,
        service: serviceCredits,
      },
      worksByType,
      worksByIndex,
      summary: {
        highImpact: credits.filter((c) =>
          ['SCI', 'SCIE', 'SSCI', 'SCOPUS'].includes(c.work.journalIndex || ''),
        ).length,
        local: credits.filter((c) => c.work.journalIndex === 'LOCAL').length,
        other: credits.filter((c) => !c.work.journalIndex || c.work.journalIndex === 'NONE')
          .length,
      },
    };

    // Create annual report
    const report = await this.prisma.annualReport.create({
      data: {
        userId,
        year,
        totalCredits,
        researchCredits,
        teachingCredits,
        serviceCredits,
        reportData,
      },
      include: {
        user: {
          include: {
            department: true,
          },
        },
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'ANNUAL_REPORT_GENERATED',
        targetTable: 'annual_reports',
        targetId: report.id,
        meta: { year, totalCredits },
      },
    });

    return report as AnnualReport;
  }

  async findAll(filter?: { userId?: string; year?: number; page?: number; size?: number }) {
    const where: Prisma.AnnualReportWhereInput = {};

    if (filter?.userId) {
      where.userId = filter.userId;
    }

    if (filter?.year) {
      where.year = filter.year;
    }

    const page = filter?.page || 1;
    const size = filter?.size || 20;
    const skip = (page - 1) * size;

    const [reports, total] = await Promise.all([
      this.prisma.annualReport.findMany({
        where,
        include: {
          user: {
            include: {
              department: true,
            },
          },
        },
        orderBy: [{ year: 'desc' }, { generatedAt: 'desc' }],
        skip,
        take: size,
      }),
      this.prisma.annualReport.count({ where }),
    ]);

    return {
      data: reports,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async findOne(id: string): Promise<AnnualReport> {
    const report = await this.prisma.annualReport.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException(`Annual report with ID ${id} not found`);
    }

    return report as AnnualReport;
  }

  async findByUserAndYear(userId: string, year: number): Promise<AnnualReport | null> {
    return this.prisma.annualReport.findUnique({
      where: {
        userId_year: {
          userId,
          year,
        },
      },
      include: {
        user: {
          include: {
            department: true,
          },
        },
      },
    }) as Promise<AnnualReport | null>;
  }

  async delete(id: string): Promise<AnnualReport> {
    return this.prisma.annualReport.delete({
      where: { id },
    });
  }

  async getDepartmentSummary(departmentId: string, year: number) {
    const users = await this.prisma.user.findMany({
      where: { departmentId },
      include: {
        annualReports: {
          where: { year },
        },
      },
    });

    const summary = {
      departmentId,
      year,
      totalUsers: users.length,
      usersWithReports: users.filter((u) => u.annualReports.length > 0).length,
      totalCredits: users.reduce(
        (sum, u) =>
          sum +
          u.annualReports.reduce((s, r) => s + Number(r.totalCredits), 0),
        0,
      ),
      averageCredits: 0,
      topPerformers: [] as any[],
    };

    summary.averageCredits =
      summary.usersWithReports > 0 ? summary.totalCredits / summary.usersWithReports : 0;

    // Get top 5 performers
    const usersWithCredits = users
      .map((u) => ({
        userId: u.id,
        fullName: u.fullName,
        credits: u.annualReports.reduce((s, r) => s + Number(r.totalCredits), 0),
      }))
      .filter((u) => u.credits > 0)
      .sort((a, b) => b.credits - a.credits)
      .slice(0, 5);

    summary.topPerformers = usersWithCredits;

    return summary;
  }
}

