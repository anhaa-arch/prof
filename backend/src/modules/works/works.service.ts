import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Work, WorkStatus, Prisma, Role, User } from '@prisma/client';

@Injectable()
export class WorksService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter?: {
    status?: WorkStatus;
    type?: string;
    journalIndex?: string;
    year?: number;
    createdBy?: string;
    search?: string;
    page?: number;
    size?: number;
  }) {
    const where: Prisma.WorkWhereInput = {};

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.type) {
      where.type = filter.type as any;
    }

    if (filter?.journalIndex) {
      where.journalIndex = filter.journalIndex as any;
    }

    if (filter?.year) {
      where.year = filter.year;
    }

    if (filter?.createdBy) {
      where.createdBy = filter.createdBy;
    }

    if (filter?.search) {
      where.OR = [
        { title: { contains: filter.search } },
        { abstract: { contains: filter.search } },
        { journalName: { contains: filter.search } },
      ];
    }

    const page = filter?.page || 1;
    const size = filter?.size || 20;
    const skip = (page - 1) * size;

    const [works, total] = await Promise.all([
      this.prisma.work.findMany({
        where,
        include: {
          creator: true,
          authors: {
            include: { user: true },
            orderBy: { order: 'asc' },
          },
          files: true,
          _count: {
            select: { verificationLogs: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: size,
      }),
      this.prisma.work.count({ where }),
    ]);

    return {
      data: works,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async findOne(id: string): Promise<Work> {
    const work = await this.prisma.work.findUnique({
      where: { id },
      include: {
        creator: true,
        authors: {
          include: { user: true },
          orderBy: { order: 'asc' },
        },
        files: {
          include: { uploader: true },
        },
        verificationLogs: {
          include: { verifier: true },
          orderBy: { timestamp: 'desc' },
        },
        credits: {
          include: { user: true },
        },
      },
    });

    if (!work) {
      throw new NotFoundException(`Work with ID ${id} not found`);
    }

    return work as Work;
  }

  async create(
    userId: string,
    data: {
      title: string;
      abstract?: string;
      language: string;
      type: string;
      journalName?: string;
      journalIndex?: string;
      doi?: string;
      issn?: string;
      volume?: string;
      issue?: string;
      pages?: string;
      year: number;
      publishedDate?: Date;
      authors: Array<{
        userId?: string;
        authorName: string;
        contributionPercent: number;
        order: number;
        isCorresponding: boolean;
      }>;
    },
  ): Promise<Work> {
    // Calculate credit base based on journal index
    const creditBase = await this.calculateCreditBase(data.journalIndex);

    // Validate contribution percentages sum
    const totalContribution = data.authors.reduce(
      (sum, author) => sum + author.contributionPercent,
      0,
    );

    if (Math.abs(totalContribution - 100) > 0.01) {
      throw new ForbiddenException('Author contributions must sum to 100%');
    }

    return this.prisma.work.create({
      data: {
        title: data.title,
        abstract: data.abstract,
        language: data.language,
        type: data.type as any,
        journalName: data.journalName,
        journalIndex: data.journalIndex as any,
        doi: data.doi,
        issn: data.issn,
        volume: data.volume,
        issue: data.issue,
        pages: data.pages,
        year: data.year,
        publishedDate: data.publishedDate,
        creditBase,
        createdBy: userId,
        status: WorkStatus.DRAFT,
        authors: {
          create: data.authors.map((author) => ({
            userId: author.userId,
            authorName: author.authorName,
            contributionPercent: author.contributionPercent,
            order: author.order,
            isCorresponding: author.isCorresponding,
          })),
        },
      },
      include: {
        creator: true,
        authors: {
          include: { user: true },
        },
      },
    });
  }

  async update(
    id: string,
    userId: string,
    userRole: Role,
    data: Partial<{
      title: string;
      abstract: string;
      language: string;
      type: string;
      journalName: string;
      journalIndex: string;
      doi: string;
      issn: string;
      volume: string;
      issue: string;
      pages: string;
      year: number;
      publishedDate: Date;
      status: WorkStatus;
    }>,
  ): Promise<Work> {
    const work = await this.findOne(id);

    // Check permissions: only creator or admin/ESH can update
    if (work.createdBy !== userId && userRole !== Role.ADMIN && userRole !== Role.ESH) {
      throw new ForbiddenException('You do not have permission to update this work');
    }

    // Recalculate credit base if journal index changed
    let creditBase: any = work.creditBase;
    if (data.journalIndex && data.journalIndex !== work.journalIndex) {
      creditBase = await this.calculateCreditBase(data.journalIndex);
    }

    return this.prisma.work.update({
      where: { id },
      data: {
        ...data,
        creditBase,
        type: data.type as any,
        journalIndex: data.journalIndex as any,
        status: data.status as any,
      },
      include: {
        creator: true,
        authors: {
          include: { user: true },
        },
      },
    });
  }

  async delete(id: string, userId: string, userRole: Role): Promise<Work> {
    const work = await this.findOne(id);

    // Check permissions
    if (work.createdBy !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this work');
    }

    return this.prisma.work.delete({
      where: { id },
    });
  }

  async submitForVerification(id: string, userId: string): Promise<Work> {
    const work = await this.findOne(id);

    if (work.createdBy !== userId) {
      throw new ForbiddenException('You can only submit your own works');
    }

    if (work.status !== WorkStatus.DRAFT) {
      throw new ForbiddenException('Only draft works can be submitted');
    }

    return this.prisma.work.update({
      where: { id },
      data: { status: WorkStatus.SUBMITTED },
      include: {
        creator: true,
        authors: {
          include: { user: true },
        },
      },
    });
  }

  async search(options: {
    query?: string;
    filters?: any;
    authorName?: string;
    page?: number;
    size?: number;
  }) {
    const {
      query,
      filters,
      authorName,
      page = 1,
      size = 20,
    } = options;

    const where: Prisma.WorkWhereInput = {};
    const andConditions: Prisma.WorkWhereInput[] = [];

    const normalizedQuery = query?.trim();
    if (normalizedQuery) {
      andConditions.push({
        OR: [
          { title: { contains: normalizedQuery, mode: 'insensitive' } },
          { abstract: { contains: normalizedQuery, mode: 'insensitive' } },
          { journalName: { contains: normalizedQuery, mode: 'insensitive' } },
          { doi: { contains: normalizedQuery, mode: 'insensitive' } },
        ],
      });
    }

    const normalizedAuthor = authorName?.trim();
    if (normalizedAuthor) {
      andConditions.push({
        authors: {
          some: {
            authorName: { contains: normalizedAuthor, mode: 'insensitive' },
          },
        },
      });
    }

    if (filters) {
      if (filters.status) {
        andConditions.push({
          status: filters.status,
        });
      }

      if (filters.type) {
        andConditions.push({
          type: filters.type,
        });
      }

      if (filters.journalIndex) {
        andConditions.push({
          journalIndex: filters.journalIndex,
        });
      }

      if (filters.createdBy) {
        andConditions.push({
          createdBy: filters.createdBy,
        });
      }

      if (filters.year) {
        andConditions.push({
          year: filters.year,
        });
      } else if (filters.yearFrom || filters.yearTo) {
        const yearFilter: Prisma.IntFilter = {};
        if (filters.yearFrom) {
          yearFilter.gte = filters.yearFrom;
        }
        if (filters.yearTo) {
          yearFilter.lte = filters.yearTo;
        }
        andConditions.push({
          year: yearFilter,
        });
      }

      const filterSearch = filters.search?.trim();
      if (filterSearch) {
        andConditions.push({
          OR: [
            { title: { contains: filterSearch, mode: 'insensitive' } },
            { abstract: { contains: filterSearch, mode: 'insensitive' } },
            { journalName: { contains: filterSearch, mode: 'insensitive' } },
            { doi: { contains: filterSearch, mode: 'insensitive' } },
          ],
        });
      }
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const skip = (page - 1) * size;

    const [works, total] = await Promise.all([
      this.prisma.work.findMany({
        where,
        include: {
          creator: true,
          authors: {
            include: { user: true },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { year: 'desc' },
        skip,
        take: size,
      }),
      this.prisma.work.count({ where }),
    ]);

    return {
      data: works,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  private async calculateCreditBase(journalIndex?: string): Promise<number> {
    if (!journalIndex || journalIndex === 'NONE') {
      return 2;
    }

    const configKey = `credit_base_${journalIndex.toLowerCase()}`;
    const config = await this.prisma.systemConfig.findUnique({
      where: { key: configKey },
    });

    if (config && typeof config.value === 'number') {
      return config.value;
    }

    // Default values
    const defaults: Record<string, number> = {
      SCI: 12,
      SCIE: 11,
      SSCI: 11,
      SCOPUS: 10,
      INDEX_MEDICUS: 8,
      LOCAL: 4,
    };

    return defaults[journalIndex] || 2;
  }
}
