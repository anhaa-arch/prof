import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CreditsService } from './credits.service';
import { CreditsResolver } from './credits.resolver';
import { CreditCalculationProcessor } from './credit-calculation.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'works',
    }),
  ],
  providers: [CreditsService, CreditsResolver, CreditCalculationProcessor],
  exports: [CreditsService],
})
export class CreditsModule {}

