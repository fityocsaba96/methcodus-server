import { Module } from '@nestjs/common';
import { PairProgrammingGateway } from './pair-programming.gateway';
import { PairProgrammingRequestModule } from '../pair-programming-request/pair-programming-request.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PairProgrammingRequestModule, UserModule],
  providers: [PairProgrammingGateway],
})
export class PairProgrammingModule {}
