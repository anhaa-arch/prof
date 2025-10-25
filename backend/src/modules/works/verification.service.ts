import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkStatus, VerificationAction, Role } from '@prisma/client';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class VerificationService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('works') private worksQueue: Queue,
  ) {}

  async approve(workId: string, verifierId: string, note?: string) {
    // Create verification log
    await this.prisma.verificationLog.create({
      data: {
        workId,
        verifiedBy: verifierId,
        action: VerificationAction.APPROVE,
        note,
      },
    });

    // Update work status
    const work = await this.prisma.work.update({
      where: { id: workId },
      data: { status: WorkStatus.VERIFIED },
      include: {
        authors: true,
      },
    });

    // Trigger credit calculation job
    await this.worksQueue.add('calculate-credits', { workId });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: verifierId,
        action: 'WORK_APPROVED',
        targetTable: 'works',
        targetId: workId,
        meta: { note },
      },
    });

    return work;
  }

  async reject(workId: string, verifierId: string, note?: string) {
    // Create verification log
    await this.prisma.verificationLog.create({
      data: {
        workId,
        verifiedBy: verifierId,
        action: VerificationAction.REJECT,
        note,
      },
    });

    // Update work status
    const work = await this.prisma.work.update({
      where: { id: workId },
      data: { status: WorkStatus.REJECTED },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: verifierId,
        action: 'WORK_REJECTED',
        targetTable: 'works',
        targetId: workId,
        meta: { note },
      },
    });

    return work;
  }

  async requestChanges(workId: string, verifierId: string, note: string) {
    // Create verification log
    await this.prisma.verificationLog.create({
      data: {
        workId,
        verifiedBy: verifierId,
        action: VerificationAction.REQUEST_CHANGES,
        note,
      },
    });

    // Update work status back to draft
    const work = await this.prisma.work.update({
      where: { id: workId },
      data: { status: WorkStatus.DRAFT },
    });

    return work;
  }

  async addComment(workId: string, verifierId: string, note: string) {
    return this.prisma.verificationLog.create({
      data: {
        workId,
        verifiedBy: verifierId,
        action: VerificationAction.COMMENT,
        note,
      },
      include: {
        verifier: true,
      },
    });
  }

  async getVerificationLogs(workId: string) {
    return this.prisma.verificationLog.findMany({
      where: { workId },
      include: {
        verifier: true,
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getPendingVerifications(page = 1, size = 20) {
    const skip = (page - 1) * size;

    const [works, total] = await Promise.all([
      this.prisma.work.findMany({
        where: { status: WorkStatus.SUBMITTED },
        include: {
          creator: true,
          authors: {
            include: { user: true },
          },
          verificationLogs: {
            take: 1,
            orderBy: { timestamp: 'desc' },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: size,
      }),
      this.prisma.work.count({
        where: { status: WorkStatus.SUBMITTED },
      }),
    ]);

    return {
      data: works,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }
}

