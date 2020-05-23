import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExerciseModule } from './exercise/exercise.module';
import { UserModule } from './user/user.module';
import { SolutionModule } from './solution/solution.module';
import { PairProgrammingRequestModule } from './pair-programming-request/pair-programming-request.module';
import { AuthModule } from './auth/auth.module';
import { PairProgrammingModule } from './pair-programming/pair-programming.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI, { useNewUrlParser: true, useFindAndModify: false }),
    ExerciseModule,
    SolutionModule,
    UserModule,
    PairProgrammingRequestModule,
    AuthModule,
    PairProgrammingModule,
  ],
})
export class AppModule {}
