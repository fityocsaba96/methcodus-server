import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exercise } from './exercise.schema';

@Injectable()
export class ExerciseService {
  constructor(@InjectModel(Exercise.name) private readonly exerciseModel: Model<Exercise>) {}
}
