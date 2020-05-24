import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { SolutionService } from './solution.service';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { Request as ExpressRequest } from 'express';
import { Solution } from './solution.schema';
import { map, pick } from 'ramda';

@Controller('solutions')
export class SolutionController {
  constructor(private readonly solutionService: SolutionService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  public async getMine(@Request() request: ExpressRequest): Promise<Partial<Solution>> {
    return map(
      pick(['solvedAt', 'exercise', 'programmingLanguage', 'softwareDevelopmentMethod', 'pairUser', 'code']),
      await this.solutionService.findAllByUserAndPopulate((request.user as any)._id),
    );
  }
}
