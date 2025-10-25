import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ReportsService } from './reports.service';
import { ReportsResolver } from './reports.resolver';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'reports',
    }),
  ],
  providers: [ReportsService, ReportsResolver],
  exports: [ReportsService],
})
export class ReportsModule {}

