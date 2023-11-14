import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ExtractsService } from '../services/extracts.service';
import { Extracts } from '../models/extracts.interface';
import { Observable } from 'rxjs';
import { getRepository } from 'typeorm';

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
    async consultarOpcoes(@Query('userOptions') userOptions: string, @Query('filterData') filterData: string) {
        let query: string = '';

        //(en) Checks if there is a value other than doc_type.
        const hasOtherValue = userOptions.split(',').some(option => option !== 'doc_type');

        //(en) Gets the current date.
        const currentDate = new Date();

        //(en) Converts the current date to a string.
        const formattedDate = currentDate.toISOString();

        //(en) Takes the date provided by the user and puts it in an array.
        const filterDataArray = filterData.split(',');

        //(en) Separates the start and end dates.
        let startDateFormated = new Date(filterDataArray[0]);
        let endDateFormated = new Date(filterDataArray[1]);

        //(en) Variables that will be used in the database queries.
        let startDate: string = '';
        let endDate: string = '';

        //(en) If the user does not provide a date.
        if (filterData === '') {
            //(en) Sets the start date as 2000/01/01. 
            startDate = '2000-01-01T00:00:00.000Z';
            //(en) Sets the end date as the current date.
            endDate = formattedDate;
        } else {
            //(en) Sets the dates with the values provided by the user, converting them to strings.
            startDate = startDateFormated.toISOString();
            endDate = endDateFormated.toISOString();
        }

        console.log('start: ' + startDate)
        console.log('end: ' + endDate)

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
                WHERE e.created_at > '${startDate}' AND e.created_at < '${endDate}'
                GROUP BY e.doc_type
            `;
        } else if (userOptions.includes('doc_type') && userOptions.includes('name')) {
            query = `
                SELECT 
                    count(e.doc_type)       AS "Documentos processados",
                    u.name                  AS "Usuário"
                FROM 
                    extracts AS e
                JOIN
                    users AS u
                ON
                    u.id = e.user_id
                WHERE e.created_at > '${startDate}' AND e.created_at < '${endDate}'
                GROUP BY
                    u.name
            `
        } else if (userOptions.includes('pages_process') && userOptions.includes('name')) {
            query = `
                SELECT 
                    sum(e.pages_process)        AS "Páginas Processadas",
                    u.name                      AS "Usuário"
                FROM 
                    extracts AS e
                JOIN
                    users AS u
                ON
                    u.id = e.user_id
                WHERE e.created_at > '${startDate}' AND e.created_at < '${endDate}'
                GROUP BY
                    u.name
            `
        } else if (userOptions.includes('pages_process') && userOptions.includes('segment')) {
            query = `
                SELECT 
                    sum(e.pages_process)        AS "Páginas Processadas",
                    CASE
                        WHEN u.segment = 'imobiliaria' THEN REPLACE (u.segment, 'imobiliaria', 'Imobiliária')
                        WHEN u.segment = 'construtora' THEN INITCAP (u.segment)
                        WHEN u.segment = 'financeira' THEN INITCAP (u.segment)
                        WHEN u.segment = 'banco' THEN INITCAP (u.segment)
                    END AS "Segmento"
                FROM 
                    extracts AS e
                JOIN
                    users AS u
                ON
                    u.id = e.user_id
                WHERE e.created_at > '${startDate}' AND e.created_at < '${endDate}'
                GROUP BY
                    u.segment
            `
        } else if (userOptions.includes('doc_type') && userOptions.includes('segment')) {
            query = `
                SELECT 
                    count(e.doc_type)        AS "Documentos processados",
                    CASE
                        WHEN u.segment = 'imobiliaria' THEN REPLACE (u.segment, 'imobiliaria', 'Imobiliária')
                        WHEN u.segment = 'construtora' THEN INITCAP (u.segment)
                        WHEN u.segment = 'financeira' THEN INITCAP (u.segment)
                        WHEN u.segment = 'banco' THEN INITCAP (u.segment)
                    END AS "Segmento"
                FROM 
                    extracts AS e
                JOIN
                    users AS u
                ON
                    u.id = e.user_id
                WHERE e.created_at > '${startDate}' AND e.created_at < '${endDate}'
                GROUP BY
                    u.segment
            `
        } else if (hasOtherValue === false) {
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
                WHERE e.created_at > '${startDate}' AND e.created_at < '${endDate}'
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
