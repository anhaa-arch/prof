import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter?: { role?: Role; departmentId?: string; search?: string }) {
    const where: Prisma.UserWhereInput = {};

    if (filter?.role) {
      where.role = filter.role;
    }

    if (filter?.departmentId) {
      where.departmentId = filter.departmentId;
    }

    if (filter?.search) {
      where.OR = [
        { fullName: { contains: filter.search } },
        { email: { contains: filter.search } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      include: {
        department: true,
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        department: true,
        worksCreated: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        credits: {
          take: 10,
          orderBy: { calculatedAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { department: true },
    });
  }

  async create(data: {
    email: string;
    password: string;
    fullName: string;
    role: Role;
    departmentId?: string;
  }): Promise<User> {
    const passwordHash = await bcrypt.hash(data.password, 12);

    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        role: data.role,
        departmentId: data.departmentId,
      },
      include: { department: true },
    });
  }

  async update(
    id: string,
    data: {
      email?: string;
      fullName?: string;
      role?: Role;
      departmentId?: string;
      isActive?: boolean;
    },
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: { department: true },
    });
  }

  async updatePassword(id: string, newPassword: string): Promise<User> {
    const passwordHash = await bcrypt.hash(newPassword, 12);

    return this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async delete(id: string): Promise<User> {
    // Soft delete by setting isActive to false
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getTotalCredits(userId: string, year?: number) {
    const where: Prisma.CreditWhereInput = { userId };

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

    return result._sum.creditValue || 0;
  }
}

