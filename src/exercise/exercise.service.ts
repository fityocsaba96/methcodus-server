import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Exercise } from './exercise.schema';
import { CreateExerciseDto } from './exercise.dto';

@Injectable()
export class ExerciseService {
  constructor(@InjectModel(Exercise.name) private readonly exerciseModel: Model<Exercise>) {}

  public async findAllByCreatedBy(createdBy: string): Promise<Exercise[]> {
    return this.exerciseModel.find({ createdBy: Types.ObjectId(createdBy) as any });
  }

  public async insert(createdBy: string, createExerciseDto: CreateExerciseDto): Promise<Exercise> {
    const exercise = new this.exerciseModel(createExerciseDto);
    exercise.createdAt = new Date();
    exercise.createdBy = Types.ObjectId(createdBy) as any;
    return exercise.save();
  }
}
