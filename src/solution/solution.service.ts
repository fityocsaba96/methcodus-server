import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Solution } from './solution.schema';

@Injectable()
export class SolutionService {
  constructor(@InjectModel(Solution.name) private readonly solutionModel: Model<Solution>) {}
}
