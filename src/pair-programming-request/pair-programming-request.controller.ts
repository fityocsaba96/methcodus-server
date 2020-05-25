import { Controller, Get, UseGuards, Request, Response } from '@nestjs/common';
import { PairProgrammingRequestService } from './pair-programming-request.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { dissocPath } from 'ramda';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { PairProgrammingRequest } from './pair-programming-request.interface';

@Controller('pair-programming-requests')
export class PairProgrammingRequestController {
  constructor(private readonly pairProgrammingRequestService: PairProgrammingRequestService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  public async getMine(
    @Request() request: ExpressRequest,
    @Response() response: ExpressResponse,
  ): Promise<Partial<PairProgrammingRequest> | void> {
    const pairProgrammingRequest = this.pairProgrammingRequestService.find((request.user as any)._id);
    if (pairProgrammingRequest !== undefined) {
      response.send(dissocPath(['pairUser', 'socket'], pairProgrammingRequest));
    } else {
      response.status(204).send();
    }
  }
}
