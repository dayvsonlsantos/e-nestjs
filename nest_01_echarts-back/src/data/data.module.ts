import { Module } from '@nestjs/common';
import { ExtractsController } from './extracts_table/controllers/extracts.controller';
import { ExtractsService } from './extracts_table/services/extracts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExtractsEntity } from './extracts_table/models/extracts.entity';
import { UsersService } from './users_table/services/users.service';
import { UsersController } from './users_table/controllers/users.controller';
import { UsersEntity } from './users_table/models/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExtractsEntity, UsersEntity])
  ],
  providers: [ExtractsService, UsersService],
  controllers: [ExtractsController, UsersController],
})
export class DataModule {}
