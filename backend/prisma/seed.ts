import { PrismaClient, Role, WorkType, JournalIndex, WorkStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create departments
  console.log('Creating departments...');
  const cseDept = await prisma.department.upsert({
    where: { code: 'CSE' },
    update: {},
    create: {
      name: 'Компьютерийн шинжлэх ухаан',
      code: 'CSE',
    },
  });

  const mathDept = await prisma.department.upsert({
    where: { code: 'MATH' },
    update: {},
    create: {
      name: 'Математикийн тэнхим',
      code: 'MATH',
    },
  });

  const physicsDept = await prisma.department.upsert({
    where: { code: 'PHYS' },
    update: {},
    create: {
      name: 'Физикийн тэнхим',
      code: 'PHYS',
    },
  });

  // Create admin user
  console.log('Creating admin user...');
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@university.edu' },
    update: {},
    create: {
      email: 'admin@university.edu',
      passwordHash: adminPassword,
      fullName: 'Системийн Админ',
      role: Role.ADMIN,
    },
  });

  // Create ESH user
  console.log('Creating ESH user...');
  const eshPassword = await bcrypt.hash('Esh123!', 12);
  const eshUser = await prisma.user.upsert({
    where: { email: 'esh@university.edu' },
    update: {},
    create: {
      email: 'esh@university.edu',
      passwordHash: eshPassword,
      fullName: 'ЭШ Албаны Ажилтан',
      role: Role.ESH,
    },
  });

  // Create professor users
  console.log('Creating professor users...');
  const profPassword = await bcrypt.hash('Prof123!', 12);
  
  const prof1 = await prisma.user.upsert({
    where: { email: 'dorj.professor@university.edu' },
    update: {},
    create: {
      email: 'dorj.professor@university.edu',
      passwordHash: profPassword,
      fullName: 'Доржийн Бат',
      role: Role.PROFESSOR,
      departmentId: cseDept.id,
    },
  });

  const prof2 = await prisma.user.upsert({
    where: { email: 'bold.professor@university.edu' },
    update: {},
    create: {
      email: 'bold.professor@university.edu',
      passwordHash: profPassword,
      fullName: 'Болдын Сайхан',
      role: Role.ASSOC_PROF,
      departmentId: mathDept.id,
    },
  });

  const lecturer = await prisma.user.upsert({
    where: { email: 'lecturer@university.edu' },
    update: {},
    create: {
      email: 'lecturer@university.edu',
      passwordHash: profPassword,
      fullName: 'Багш Лектор',
      role: Role.LECTURER,
      departmentId: physicsDept.id,
    },
  });

  // Update department heads
  await prisma.department.update({
    where: { id: cseDept.id },
    data: { headUserId: prof1.id },
  });

  // Create system configurations for credit base values
  console.log('Creating system configurations...');
  await prisma.systemConfig.upsert({
    where: { key: 'credit_base_sci' },
    update: {},
    create: {
      key: 'credit_base_sci',
      value: 12,
      category: 'credit_base',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'credit_base_scopus' },
    update: {},
    create: {
      key: 'credit_base_scopus',
      value: 10,
      category: 'credit_base',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'credit_base_scie' },
    update: {},
    create: {
      key: 'credit_base_scie',
      value: 11,
      category: 'credit_base',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'credit_base_ssci' },
    update: {},
    create: {
      key: 'credit_base_ssci',
      value: 11,
      category: 'credit_base',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'credit_base_index_medicus' },
    update: {},
    create: {
      key: 'credit_base_index_medicus',
      value: 8,
      category: 'credit_base',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'credit_base_local' },
    update: {},
    create: {
      key: 'credit_base_local',
      value: 4,
      category: 'credit_base',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'credit_base_none' },
    update: {},
    create: {
      key: 'credit_base_none',
      value: 2,
      category: 'credit_base',
    },
  });

  // Create sample works
  console.log('Creating sample works...');
  const work1 = await prisma.work.create({
    data: {
      title: 'Machine Learning Applications in Research Management',
      abstract: 'This paper explores the application of machine learning algorithms in automating research credit calculation and management systems.',
      language: 'en',
      type: WorkType.JOURNAL_ARTICLE,
      journalName: 'Journal of Academic Computing',
      journalIndex: JournalIndex.SCOPUS,
      doi: '10.1234/jac.2024.001',
      issn: '1234-5678',
      volume: '15',
      issue: '3',
      pages: '45-67',
      year: 2024,
      publishedDate: new Date('2024-03-15'),
      status: WorkStatus.PUBLISHED,
      creditBase: 10,
      createdBy: prof1.id,
      authors: {
        create: [
          {
            userId: prof1.id,
            authorName: 'Доржийн Бат',
            contributionPercent: 60,
            order: 1,
            isCorresponding: true,
          },
          {
            userId: prof2.id,
            authorName: 'Болдын Сайхан',
            contributionPercent: 40,
            order: 2,
            isCorresponding: false,
          },
        ],
      },
    },
  });

  const work2 = await prisma.work.create({
    data: {
      title: 'Эрдэм шинжилгээний кредит тооцоолох систем',
      abstract: 'Монгол улсын их дээд сургуулиудад эрдэм шинжилгээний кредит тооцоолох аргачлалын судалгаа',
      language: 'mn',
      type: WorkType.JOURNAL_ARTICLE,
      journalName: 'Шинжлэх Ухааны Өгүүлэл',
      journalIndex: JournalIndex.LOCAL,
      year: 2024,
      status: WorkStatus.SUBMITTED,
      creditBase: 4,
      createdBy: lecturer.id,
      authors: {
        create: [
          {
            userId: lecturer.id,
            authorName: 'Багш Лектор',
            contributionPercent: 100,
            order: 1,
            isCorresponding: true,
          },
        ],
      },
    },
  });

  // Create credits for published work
  console.log('Creating credits...');
  await prisma.credit.create({
    data: {
      userId: prof1.id,
      workId: work1.id,
      creditValue: 6.0, // 10 * 60% = 6.0
      calculationDetail: {
        baseCredit: 10,
        contributionPercent: 60,
        formula: 'baseCredit * (contributionPercent / 100)',
      },
    },
  });

  await prisma.credit.create({
    data: {
      userId: prof2.id,
      workId: work1.id,
      creditValue: 4.0, // 10 * 40% = 4.0
      calculationDetail: {
        baseCredit: 10,
        contributionPercent: 40,
        formula: 'baseCredit * (contributionPercent / 100)',
      },
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Created Users:');
  console.log('  Admin: admin@university.edu / Admin123!');
  console.log('  ESH: esh@university.edu / Esh123!');
  console.log('  Professor: dorj.professor@university.edu / Prof123!');
  console.log('  Assoc Prof: bold.professor@university.edu / Prof123!');
  console.log('  Lecturer: lecturer@university.edu / Prof123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

