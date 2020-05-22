import { Controller } from '@nestjs/common';
import { SolutionService } from './solution.service';

@Controller('solutions')
export class SolutionController {
  constructor(private readonly solutionService: SolutionService) {}
}
