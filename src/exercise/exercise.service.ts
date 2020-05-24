import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Exercise } from './exercise.schema';
import { CreateExerciseDto } from './exercise.dto';
import { User } from 'src/user/user.schema';

@Injectable()
export class ExerciseService {
  constructor(
    @InjectModel(Exercise.name) private readonly exerciseModel: Model<Exercise>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  public async findAllByCreatedBy(createdBy: string): Promise<Exercise[]> {
    return this.exerciseModel.find({ createdBy: Types.ObjectId(createdBy) as any });
  }

  public async findAllAndPopulateUserName(): Promise<Exercise[]> {
    return this.exerciseModel.find().populate('createdBy', 'userName', this.userModel);
  }

  public async findByIdAndPopulateUserName(_id: string): Promise<Exercise> {
    return this.exerciseModel.findById(_id).populate('createdBy', 'userName', this.userModel);
  }

  public async insert(createdBy: string, createExerciseDto: CreateExerciseDto): Promise<Exercise> {
    const exercise = new this.exerciseModel(createExerciseDto);
    exercise.createdAt = new Date();
    exercise.createdBy = Types.ObjectId(createdBy) as any;
    return exercise.save();
  }
}
