import { Body, Controller, Get, Post } from '@nestjs/common';
import { DataService } from '../services/data.service';
import { Extracts } from '../models/extracts.interface';
import { Observable } from 'rxjs';

@Controller('data')
export class DataController {
    constructor(private dataService: DataService) { }

    @Post()
    create(@Body() extractData: Extracts): Observable<Extracts> {
        return this.dataService.createData(extractData)
    }

    @Get()
    findAll(): Observable<Extracts[]> {
        return this.dataService.findAll();
    }
}
