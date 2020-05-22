import { Controller, Get } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { Exercise } from './exercise.schema';

@Controller('exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}
}
