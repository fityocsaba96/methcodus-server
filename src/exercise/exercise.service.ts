import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Exercise } from './exercise.schema';

@Injectable()
export class ExerciseService {
  constructor(@InjectModel(Exercise.name) private readonly exerciseModel: Model<Exercise>) {}

  public async findAllByCreatedBy(createdBy: string): Promise<Exercise[]> {
    return this.exerciseModel.find({ createdBy: Types.ObjectId(createdBy) as any });
  }
}
