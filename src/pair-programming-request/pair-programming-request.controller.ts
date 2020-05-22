import { Controller } from '@nestjs/common';
import { PairProgrammingRequestService } from './pair-programming-request.service';

@Controller('pair-programming-requests')
export class PairProgrammingRequestController {
  constructor(private readonly pairProgrammingRequestService: PairProgrammingRequestService) {}
}
