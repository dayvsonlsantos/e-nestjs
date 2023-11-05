import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ExtractsService } from '../services/extracts.service';
import { Extracts } from '../models/extracts.interface';
import { Observable } from 'rxjs';

@Controller('extracts')
export class ExtractsController {
    constructor(private extractsService: ExtractsService) { }

    // @Post()
    // create(@Body() extract: Extracts): Observable<Extracts> {
    //     return this.extractsService.createData(extract)
    // }

    // @Get()
    // findAll(): Observable<Extracts[]> {
    //     return this.extractsService.findAll();
    // }

    @Get()
    async consultarOpcoes(@Query('userOptions') userOptions: string) {
        const optionsArray = userOptions.split(',');
        const query = `
            SELECT 
                count(e.${optionsArray[0]})     AS "Documentos processados",
                e.${optionsArray[1]}            AS "Documentos"
            FROM extracts AS e
            GROUP BY e.${optionsArray[0]}
        `; // Construa a consulta SQL dinâmica aqui
        return this.extractsService.executarConsulta(query);
    }
}
