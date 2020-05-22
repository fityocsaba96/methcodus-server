import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TesterModule } from './tester/tester.module';

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGODB_URI, { useNewUrlParser: true }), TesterModule],
})
export class AppModule {}
