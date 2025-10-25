import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { WorksService } from './works.service';
import { WorksResolver } from './works.resolver';
import { VerificationService } from './verification.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'works',
    }),
  ],
  providers: [WorksService, WorksResolver, VerificationService],
  exports: [WorksService, VerificationService],
})
export class WorksModule {}

