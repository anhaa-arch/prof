import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Credit, Prisma } from '@prisma/client';

@Injectable()
export class CreditsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate credits for a specific work
   * Algorithm:
   * 1. Get work and its authors
   * 2. Calculate each author's share: contributionPercent / 100
   * 3. creditValue = creditBase * share
   * 4. Store in credits table
   */
  async calculateCreditsForWork(workId: string): Promise<Credit[]> {
    const work = await this.prisma.work.findUnique({
      where: { id: workId },
      include: {
        authors: {
          include: { user: true },
        },
      },
    });

    if (!work) {
      throw new NotFoundException(`Work with ID ${workId} not found`);
    }

    // Check if credits already exist
    const existingCredits = await this.prisma.credit.findMany({
      where: { workId },
    });

    // Delete existing credits to recalculate
    if (existingCredits.length > 0) {
      await this.prisma.credit.deleteMany({
        where: { workId },
      });
    }

    const creditBase = work.creditBase;
    const credits: Credit[] = [];

    // Calculate total contribution (for normalization)
    const totalContribution = work.authors.reduce(
      (sum, author) => sum + Number(author.contributionPercent),
      0,
    );

    // Calculate credit for each author
    for (const author of work.authors) {
      if (!author.userId) {
        // Skip external authors without user ID
        continue;
      }

      // Normalize contribution percentage
      const normalizedShare = Number(author.contributionPercent) / totalContribution;
      const creditValue = Number(creditBase) * normalizedShare;

      const credit = await this.prisma.credit.create({
        data: {
          userId: author.userId,
          workId: work.id,
          creditValue: Math.round(creditValue * 100) / 100, // Round to 2 decimals
          calculationDetail: {
            baseCredit: Number(creditBase),
            contributionPercent: Number(author.contributionPercent),
            normalizedShare,
            totalContribution,
            formula: 'creditBase * (contributionPercent / totalContribution)',
            calculatedAt: new Date().toISOString(),
          },
        },
        include: {
          user: true,
          work: true,
        },
      });

      credits.push(credit as Credit);
    }

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'CREDITS_CALCULATED',
        targetTable: 'credits',
        targetId: workId,
        meta: {
          workId,
          creditsCount: credits.length,
          totalCredits: credits.reduce((sum, c) => sum + Number(c.creditValue), 0),
        },
      },
    });

    return credits;
  }

  async findAll(filter?: { userId?: string; year?: number; page?: number; size?: number }) {
    const where: Prisma.CreditWhereInput = {};

    if (filter?.userId) {
      where.userId = filter.userId;
    }

    if (filter?.year) {
      where.work = {
        year: filter.year,
      };
    }

    const page = filter?.page || 1;
    const size = filter?.size || 50;
    const skip = (page - 1) * size;

    const [credits, total] = await Promise.all([
      this.prisma.credit.findMany({
        where,
        include: {
          user: true,
          work: {
            include: {
              authors: true,
            },
          },
        },
        orderBy: { calculatedAt: 'desc' },
        skip,
        take: size,
      }),
      this.prisma.credit.count({ where }),
    ]);

    return {
      data: credits,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async findOne(id: string): Promise<Credit> {
    const credit = await this.prisma.credit.findUnique({
      where: { id },
      include: {
        user: true,
        work: {
          include: {
            authors: true,
          },
        },
      },
    });

    if (!credit) {
      throw new NotFoundException(`Credit with ID ${id} not found`);
    }

    return credit as Credit;
  }

  async getUserTotalCredits(userId: string, year?: number): Promise<number> {
    const where: Prisma.CreditWhereInput = {
      userId,
    };

    if (year) {
      where.work = {
        year,
      };
    }

    const result = await this.prisma.credit.aggregate({
      where,
      _sum: {
        creditValue: true,
      },
    });

    return Number(result._sum.creditValue) || 0;
  }

  async getUserCreditsBreakdown(userId: string, year?: number) {
    const where: Prisma.CreditWhereInput = {
      userId,
    };

    if (year) {
      where.work = {
        year,
      };
    }

    const credits = await this.prisma.credit.findMany({
      where,
      include: {
        work: true,
      },
    });

    const breakdown = {
      totalCredits: 0,
      byType: {} as Record<string, number>,
      byIndex: {} as Record<string, number>,
      byYear: {} as Record<number, number>,
      credits: credits,
    };

    for (const credit of credits) {
      const value = Number(credit.creditValue);
      breakdown.totalCredits += value;

      // By work type
      const type = credit.work.type;
      breakdown.byType[type] = (breakdown.byType[type] || 0) + value;

      // By journal index
      const index = credit.work.journalIndex || 'NONE';
      breakdown.byIndex[index] = (breakdown.byIndex[index] || 0) + value;

      // By year
      const workYear = credit.work.year;
      breakdown.byYear[workYear] = (breakdown.byYear[workYear] || 0) + value;
    }

    return breakdown;
  }

  async recalculateAllCredits(): Promise<{ success: boolean; count: number }> {
    // Get all verified/published works
    const works = await this.prisma.work.findMany({
      where: {
        OR: [{ status: 'VERIFIED' }, { status: 'PUBLISHED' }],
      },
    });

    let count = 0;
    for (const work of works) {
      await this.calculateCreditsForWork(work.id);
      count++;
    }

    return { success: true, count };
  }
}

