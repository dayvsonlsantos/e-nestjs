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
        let query: string = '';

        const hasOtherValue = userOptions.split(',').some(option => option !== 'doc_type');

        console.log('test'+hasOtherValue)

        if (userOptions.includes('pages_process') && userOptions.includes('doc_type')) {
            query = `
                SELECT 
                    sum(e.pages_process)                         AS "Páginas Processadas",
                    CASE
                        WHEN e.doc_type = 'CNH' THEN UPPER(e.doc_type)
                        WHEN e.doc_type = 'POSICAO_CONSOLIDADA' THEN REPLACE(e.doc_type, 'POSICAO_CONSOLIDADA', 'Posição Consolidada')
                        WHEN e.doc_type = 'FATURA_ENERGIA' THEN REPLACE(e.doc_type, 'FATURA_ENERGIA', 'Fatura de Energia')
                        WHEN e.doc_type = 'DECLARACAO_IR' THEN REPLACE(e.doc_type, 'DECLARACAO_IR', 'Declaração de Imposto de Renda')
                        WHEN e.doc_type = 'COMPROVANTE_RESIDENCIA' THEN REPLACE(e.doc_type, 'COMPROVANTE_RESIDENCIA', 'Comprovante de Residência')
                        WHEN e.doc_type = 'BALANCO_PATRIMONIAL' THEN REPLACE(e.doc_type, 'BALANCO_PATRIMONIAL', 'Balanço Patrimonial')
                        ELSE REPLACE(INITCAP(e.doc_type), '_', ' ')
                    END AS "Tipo de Documento"
                FROM extracts AS e
                GROUP BY e.doc_type
            `;
        }  else if (userOptions.includes('pages_process') && userOptions.includes('name')) {
            query = `
                SELECT 
                    count(e.doc_type)       AS "Quantidade de documentos processados",
                    u.name                  AS "Usuário"
                FROM 
                    extracts AS e
                JOIN
                    users AS u
                ON
                    u.id = e.user_id
                GROUP BY
                    e.doc_type
            `
        }else if (hasOtherValue === false){
            query = `
                SELECT 
                    count(e.doc_type)                         AS "Documentos processados",
                    CASE
                        WHEN e.doc_type = 'CNH' THEN UPPER(e.doc_type)
                        WHEN e.doc_type = 'POSICAO_CONSOLIDADA' THEN REPLACE(e.doc_type, 'POSICAO_CONSOLIDADA', 'Posição Consolidada')
                        WHEN e.doc_type = 'FATURA_ENERGIA' THEN REPLACE(e.doc_type, 'FATURA_ENERGIA', 'Fatura de Energia')
                        WHEN e.doc_type = 'DECLARACAO_IR' THEN REPLACE(e.doc_type, 'DECLARACAO_IR', 'Declaração de Imposto de Renda')
                        WHEN e.doc_type = 'COMPROVANTE_RESIDENCIA' THEN REPLACE(e.doc_type, 'COMPROVANTE_RESIDENCIA', 'Comprovante de Residência')
                        WHEN e.doc_type = 'BALANCO_PATRIMONIAL' THEN REPLACE(e.doc_type, 'BALANCO_PATRIMONIAL', 'Balanço Patrimonial')
                        ELSE REPLACE(INITCAP(e.doc_type), '_', ' ')
                    END AS "Tipo de Documento"
                FROM extracts AS e
                GROUP BY e.doc_type
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
