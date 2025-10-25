import { Test, TestingModule } from '@nestjs/testing';
import { CreditsService } from './credits.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CreditsService', () => {
  let service: CreditsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    work: {
      findUnique: jest.fn(),
    },
    credit: {
      findMany: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
      create: jest.fn(),
      aggregate: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreditsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CreditsService>(CreditsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateCreditsForWork', () => {
    it('should calculate credits correctly with 2 authors', async () => {
      const mockWork = {
        id: 'work-1',
        creditBase: 10,
        authors: [
          {
            userId: 'user-1',
            contributionPercent: 60,
            order: 1,
          },
          {
            userId: 'user-2',
            contributionPercent: 40,
            order: 2,
          },
        ],
      };

      mockPrismaService.work.findUnique.mockResolvedValue(mockWork);
      mockPrismaService.credit.findMany.mockResolvedValue([]);
      mockPrismaService.credit.create.mockImplementation(({ data }) => ({
        id: 'credit-' + data.userId,
        ...data,
      }));
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.calculateCreditsForWork('work-1');

      expect(result).toHaveLength(2);
      expect(result[0].creditValue).toBe(6); // 10 * 0.6 = 6.0
      expect(result[1].creditValue).toBe(4); // 10 * 0.4 = 4.0
    });

    it('should normalize contribution percentages', async () => {
      const mockWork = {
        id: 'work-1',
        creditBase: 10,
        authors: [
          {
            userId: 'user-1',
            contributionPercent: 50,
            order: 1,
          },
          {
            userId: 'user-2',
            contributionPercent: 30,
            order: 2,
          },
          {
            userId: 'user-3',
            contributionPercent: 20,
            order: 3,
          },
        ],
      };

      mockPrismaService.work.findUnique.mockResolvedValue(mockWork);
      mockPrismaService.credit.findMany.mockResolvedValue([]);
      mockPrismaService.credit.create.mockImplementation(({ data }) => ({
        id: 'credit-' + data.userId,
        ...data,
      }));
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.calculateCreditsForWork('work-1');

      expect(result).toHaveLength(3);
      expect(result[0].creditValue).toBe(5); // 10 * (50/100) = 5.0
      expect(result[1].creditValue).toBe(3); // 10 * (30/100) = 3.0
      expect(result[2].creditValue).toBe(2); // 10 * (20/100) = 2.0

      // Total should equal base credit
      const total = result.reduce((sum, c) => sum + Number(c.creditValue), 0);
      expect(total).toBeCloseTo(10, 1);
    });
  });

  describe('getUserTotalCredits', () => {
    it('should calculate total credits for user', async () => {
      mockPrismaService.credit.aggregate.mockResolvedValue({
        _sum: {
          creditValue: 25.5,
        },
      });

      const result = await service.getUserTotalCredits('user-1');

      expect(result).toBe(25.5);
      expect(mockPrismaService.credit.aggregate).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        _sum: { creditValue: true },
      });
    });

    it('should filter by year', async () => {
      mockPrismaService.credit.aggregate.mockResolvedValue({
        _sum: {
          creditValue: 15.0,
        },
      });

      const result = await service.getUserTotalCredits('user-1', 2024);

      expect(result).toBe(15.0);
      expect(mockPrismaService.credit.aggregate).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          work: { year: 2024 },
        },
        _sum: { creditValue: true },
      });
    });
  });
});

