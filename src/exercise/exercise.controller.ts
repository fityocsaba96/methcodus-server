import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { Request as ExpressRequest } from 'express';
import { Exercise } from './exercise.schema';
import { pipe, pick, map, assoc } from 'ramda';

@Controller('exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  public async getMine(@Request() request: ExpressRequest): Promise<Partial<Exercise>[]> {
    const user = request.user as any;
    return map(pipe(pick(['_id', 'createdAt', 'name']), assoc('createdBy', { userName: user.userName })))(
      await this.exerciseService.findAllByCreatedBy(user._id),
    );
  }
}
