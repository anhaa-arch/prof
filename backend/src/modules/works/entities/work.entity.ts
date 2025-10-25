import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import { WorkType, JournalIndex, WorkStatus } from '@prisma/client';
import { User } from '../../users/entities/user.entity';

// Register enums for GraphQL
registerEnumType(WorkType, {
  name: 'WorkType',
  description: 'Types of academic works',
});

registerEnumType(JournalIndex, {
  name: 'JournalIndex',
  description: 'Journal indexing systems',
});

registerEnumType(WorkStatus, {
  name: 'WorkStatus',
  description: 'Work verification status',
});

@ObjectType()
export class WorkAuthor {
  @Field(() => ID)
  id: string;

  @Field()
  workId: string;

  @Field(() => String, { nullable: true })
  userId?: string | null;

  @Field()
  authorName: string;

  @Field(() => Float)
  contributionPercent: number | any; // Allow Prisma Decimal

  @Field(() => Int)
  order: number;

  @Field()
  isCorresponding: boolean;

  @Field(() => User, { nullable: true })
  user?: User | null;
}

@ObjectType()
export class WorkFile {
  @Field(() => ID)
  id: string;

  @Field()
  workId: string;

  @Field()
  fileKey: string;

  @Field()
  fileName: string;

  @Field()
  contentType: string;

  @Field(() => Int)
  size: number;

  @Field()
  uploadedBy: string;

  @Field()
  uploadedAt: Date;

  @Field(() => User, { nullable: true })
  uploader?: User;
}

@ObjectType()
export class Work {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  abstract?: string | null;

  @Field()
  language: string;

  @Field(() => WorkType)
  type: WorkType;

  @Field(() => String, { nullable: true })
  journalName?: string | null;

  @Field(() => JournalIndex, { nullable: true })
  journalIndex?: JournalIndex | null;

  @Field(() => String, { nullable: true })
  doi?: string | null;

  @Field(() => String, { nullable: true })
  issn?: string | null;

  @Field(() => String, { nullable: true })
  volume?: string | null;

  @Field(() => String, { nullable: true })
  issue?: string | null;

  @Field(() => String, { nullable: true })
  pages?: string | null;

  @Field(() => Int)
  year: number;

  @Field(() => Date, { nullable: true })
  publishedDate?: Date | null;

  @Field(() => WorkStatus)
  status: WorkStatus;

  @Field(() => Float)
  creditBase: number | any; // Allow Prisma Decimal

  @Field()
  createdBy: string;

  @Field(() => User, { nullable: true })
  creator?: User;

  @Field(() => [WorkAuthor], { nullable: true })
  authors?: WorkAuthor[];

  @Field(() => [WorkFile], { nullable: true })
  files?: WorkFile[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class WorkConnection {
  @Field(() => [Work])
  data: Work[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  size: number;

  @Field(() => Int)
  totalPages: number;
}

