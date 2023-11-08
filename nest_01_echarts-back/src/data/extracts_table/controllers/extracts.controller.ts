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
        let query: string = '';
        let group: string = '';
        if ((optionsArray[0] === 'pages_process') || (optionsArray[1] === 'pages_process')) {
            if(optionsArray[0] === 'doc_type'){
                group = optionsArray[0];
            }else{
                group = optionsArray[1];
            }
            query = `
                SELECT 
                    sum(e.${optionsArray[0]})                         AS "Páginas Processadas",
                    CASE
                        WHEN e.${optionsArray[1]} = 'CNH' THEN UPPER(e.${optionsArray[1]})
                        WHEN e.${optionsArray[1]} = 'POSICAO_CONSOLIDADA' THEN REPLACE(e.${optionsArray[1]}, 'POSICAO_CONSOLIDADA', 'Posição Consolidada')
                        WHEN e.${optionsArray[1]} = 'FATURA_ENERGIA' THEN REPLACE(e.${optionsArray[1]}, 'FATURA_ENERGIA', 'Fatura de Energia')
                        WHEN e.${optionsArray[1]} = 'DECLARACAO_IR' THEN REPLACE(e.${optionsArray[1]}, 'DECLARACAO_IR', 'Declaração de Imposto de Renda')
                        WHEN e.${optionsArray[1]} = 'COMPROVANTE_RESIDENCIA' THEN REPLACE(e.${optionsArray[1]}, 'COMPROVANTE_RESIDENCIA', 'Comprovante de Residência')
                        WHEN e.${optionsArray[1]} = 'BALANCO_PATRIMONIAL' THEN REPLACE(e.${optionsArray[1]}, 'BALANCO_PATRIMONIAL', 'Balanço Patrimonial')
                        ELSE REPLACE(INITCAP(e.${optionsArray[1]}), '_', ' ')
                    END AS "Tipo de Documento"
                FROM extracts AS e
                GROUP BY e.${group}
            `;
        } else if ((optionsArray[0] === 'doc_type') || (optionsArray[1] === 'doc_type')) {
            query = `
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
                    END AS "Tipo de Documento"
                FROM extracts AS e
                GROUP BY e.${optionsArray[0]}
            `;
        }
        // Construa a consulta SQL dinâmica aqui
        return this.extractsService.executarConsulta(query);
    }

    @Get('/getTables')
    async getTables() {
        const query = `
        SELECT
            table_name
        FROM 
            information_schema.tables
        WHERE
            table_schema = 'public'
        ORDER BY 
            table_name;
        `;
        return this.extractsService.serv_getTables(query);
    }


    @Get('/getColumns')
    async getColumns(@Query('tableSelected') tableSelected: string) {
        const query = `
        SELECT 
            column_name
        FROM 
            information_schema.columns
        WHERE 
            table_schema = 'public'
        AND
            table_name = '${tableSelected}';
        `; // Construa a consulta SQL dinâmica aqui
        return this.extractsService.serv_getColumns(query);
    }

}
