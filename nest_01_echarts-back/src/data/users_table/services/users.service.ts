import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '../models/users.entity';
import { Repository } from 'typeorm';
import { Observable, from } from 'rxjs';
import { Users } from '../models/users.interface';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersEntity)
        private readonly usersRepository: Repository<UsersEntity>
    ){}

    findAll(): Observable<Users[]>{
        return from(this.usersRepository.find());
    }
}
