import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ExtractsEntity } from '../models/extracts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Extracts } from '../models/extracts.interface';
import { from, Observable } from 'rxjs';

@Injectable()
export class ExtractsService {
    constructor(
        @InjectRepository(ExtractsEntity)
        private readonly extractsRepository: Repository<ExtractsEntity>
    ) { }

    // createData(extract: Extracts): Observable<Extracts>{
    //     return from(this.extractsRepository.save(extract));
    // }

    // findAll(): Observable<Extracts[]> {
    //     return from(this.extractsRepository.find());
    // }

    async executarConsulta(query: string): Promise<string[]> {
        return this.extractsRepository.query(query);
    }
}
