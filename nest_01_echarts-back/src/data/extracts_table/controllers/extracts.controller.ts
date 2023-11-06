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
                count(e.${optionsArray[0]})                         AS "Documentos processados",
                CASE
                    WHEN e.${optionsArray[1]} = 'CNH' THEN UPPER(e.${optionsArray[1]})
                    WHEN e.${optionsArray[1]} = 'POSICAO_CONSOLIDADA' THEN REPLACE(e.${optionsArray[1]}, 'POSICAO_CONSOLIDADA', 'Posição Consolidada')
                    WHEN e.${optionsArray[1]} = 'FATURA_ENERGIA' THEN REPLACE(e.${optionsArray[1]}, 'FATURA_ENERGIA', 'Fatura de Energia')
                    WHEN e.${optionsArray[1]} = 'DECLARACAO_IR' THEN REPLACE(e.${optionsArray[1]}, 'DECLARACAO_IR', 'Declaração de Imposto de Renda')
                    WHEN e.${optionsArray[1]} = 'COMPROVANTE_RESIDENCIA' THEN REPLACE(e.${optionsArray[1]}, 'COMPROVANTE_RESIDENCIA', 'Comprovante de Residência')
                    WHEN e.${optionsArray[1]} = 'BALANCO_PATRIMONIAL' THEN REPLACE(e.${optionsArray[1]}, 'BALANCO_PATRIMONIAL', 'Balanço Patrimonial')
                    ELSE REPLACE(INITCAP(e.${optionsArray[1]}), '_', ' ')
                END AS "Documentos"
            FROM extracts AS e
            GROUP BY e.${optionsArray[0]}
        `; // Construa a consulta SQL dinâmica aqui
        return this.extractsService.executarConsulta(query);
    }
}
