import { Module } from '@nestjs/common';
import { ExtractsController } from './extracts_table/controllers/extracts.controller';
import { ExtractsService } from './extracts_table/services/extracts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExtractsEntity } from './extracts_table/models/extracts.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExtractsEntity])
  ],
  providers: [ExtractsService],
  controllers: [ExtractsController],
})
export class DataModule {}
