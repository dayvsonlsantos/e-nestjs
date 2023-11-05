import { Module } from '@nestjs/common';
import { DataController } from './controllers/data.controller';
import { DataService } from './services/data.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExtractsEntity } from './models/extracts.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExtractsEntity])
  ],
  providers: [DataService],
  controllers: [DataController],
})
export class DataModule {}
