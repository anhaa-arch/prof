import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Department } from '@prisma/client';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Department[]> {
    return this.prisma.department.findMany({
      include: {
        head: true,
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        head: true,
        users: {
          orderBy: { fullName: 'asc' },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department as Department;
  }

  async create(data: { name: string; code: string; headUserId?: string }): Promise<Department> {
    return this.prisma.department.create({
      data,
      include: { head: true },
    });
  }

  async update(
    id: string,
    data: { name?: string; code?: string; headUserId?: string },
  ): Promise<Department> {
    return this.prisma.department.update({
      where: { id },
      data,
      include: { head: true },
    });
  }

  async delete(id: string): Promise<Department> {
    return this.prisma.department.delete({
      where: { id },
    });
  }
}

