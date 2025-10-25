import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { CreditsService } from './credits.service';
import { Logger } from '@nestjs/common';

@Processor('works')
export class CreditCalculationProcessor {
  private readonly logger = new Logger(CreditCalculationProcessor.name);

  constructor(private creditsService: CreditsService) {}

  @Process('calculate-credits')
  async handleCreditCalculation(job: Job) {
    this.logger.log(`Processing credit calculation for work: ${job.data.workId}`);

    try {
      const credits = await this.creditsService.calculateCreditsForWork(job.data.workId);
      
      this.logger.log(
        `Successfully calculated ${credits.length} credits for work ${job.data.workId}`,
      );

      return { success: true, credits: credits.length };
    } catch (error) {
      this.logger.error(`Failed to calculate credits: ${error.message}`, error.stack);
      throw error;
    }
  }
}

