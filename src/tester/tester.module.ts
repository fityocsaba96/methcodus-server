import { Module } from '@nestjs/common';
import { TesterController } from './tester.controller';
import { TesterService } from './tester.service';

@Module({
  controllers: [TesterController],
  providers: [TesterService],
})
export class TesterModule {}
