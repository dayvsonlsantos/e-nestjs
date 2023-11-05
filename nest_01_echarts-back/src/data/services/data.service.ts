import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ExtractsEntity } from '../models/extracts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Extracts } from '../models/extracts.interface';
import { from, Observable } from 'rxjs';

@Injectable()
export class DataService {
    constructor(
        @InjectRepository(ExtractsEntity)
        private readonly dataRepository: Repository<ExtractsEntity>
    ){}

    createData(extractData: Extracts): Observable<Extracts>{
        return from(this.dataRepository.save(extractData));
    }

    findAll(): Observable<Extracts[]>{
        return from(this.dataRepository.find());
    }
}
