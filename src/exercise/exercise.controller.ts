import { Controller, Get, UseGuards, Request, Post, HttpCode, UsePipes, Body } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { Request as ExpressRequest } from 'express';
import { Exercise } from './exercise.schema';
import { pipe, pick, map, assoc } from 'ramda';
import { validationPipe } from 'src/lib/validation-error';
import { CreateExerciseDto } from './exercise.dto';

@Controller('exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  public async getMine(@Request() request: ExpressRequest): Promise<Partial<Exercise>[]> {
    const user = request.user as any;
    return map(pipe(pick(['_id', 'createdAt', 'name']), assoc('createdBy', { _id: user._id, userName: user.userName })))(
      await this.exerciseService.findAllByCreatedBy(user._id),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  public async getAll(): Promise<Partial<Exercise>[]> {
    return map(pick(['_id', 'createdAt', 'name', 'createdBy']), await this.exerciseService.findAllAndPopulateUserName());
  }

  @Post()
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @UsePipes(validationPipe)
  public async create(@Request() request: ExpressRequest, @Body() createExerciseDto: CreateExerciseDto): Promise<void> {
    await this.exerciseService.insert((request.user as any)._id, createExerciseDto);
  }
}
