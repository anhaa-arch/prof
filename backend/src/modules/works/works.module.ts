import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { WorksService } from './works.service';
import { WorksResolver } from './works.resolver';
import { VerificationService } from './verification.service';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'works',
    }),
    CreditsModule,
  ],
  providers: [WorksService, WorksResolver, VerificationService],
  exports: [WorksService, VerificationService],
})
export class WorksModule {}

