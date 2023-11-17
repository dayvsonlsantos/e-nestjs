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
    async consultarOpcoes(@Query('userOptions') userOptions: string, @Query('filterDate') filterDate: string, @Query('filterUserOptions') filterUserOptions: string) {

        console.log('testenovo' + filterUserOptions)

        let query: string = '';

        //(en) Checks if there is a value other than doc_type.
        const hasOtherValue = userOptions.split(',').some(option => option !== 'doc_type');

        //(en) Gets the current date.
        const currentDate = new Date();

        //(en) Converts the current date to a string.
        const formattedDate = currentDate.toISOString();

        //(en) Takes the date provided by the user and puts it in an array.
        const filterDateArray = filterDate.split(',');

        //(en) Separates the start and end dates.
        let startDateFormated = new Date(filterDateArray[0]);
        let endDateFormated = new Date(filterDateArray[1]);

        //(en) Variables that will be used in the database queries.
        let startDate: string = '';
        let endDate: string = '';

        //(en) If the user does not provide a date.
        if (filterDate === '') {
            //(en) Sets the start date as 2000/01/01. 
            startDate = '2000-01-01T00:00:00.000Z';
            //(en) Sets the end date as the current date.
            endDate = formattedDate;
        } else {
            //(en) Sets the dates with the values provided by the user, converting them to strings.
            startDate = startDateFormated.toISOString();
            endDate = endDateFormated.toISOString();
        }

        //(en) Takes the filter options provided by the user and puts it in an array.
        const filterUserOptionsArray = filterUserOptions.split(',');
        console.log(userOptions.includes('pages_process') && userOptions.includes('segment') && filterUserOptionsArray[0] === 'avg')
        console.log(filterUserOptionsArray[0] === 'avg')

        try {
            if (userOptions.includes('pages_process') && userOptions.includes('doc_type') && filterUserOptionsArray[0] === '') {
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
                    WHERE e.created_at >= '${startDate}' AND e.created_at <= '${endDate}'
                    GROUP BY e.doc_type
                `;
            } else if (userOptions.includes('doc_type') && userOptions.includes('name') && filterUserOptionsArray[0] === '') {
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
                    WHERE e.created_at >= '${startDate}' AND e.created_at <= '${endDate}'
                    GROUP BY
                        u.name
                `
            } else if (userOptions.includes('pages_process') && userOptions.includes('name') && filterUserOptionsArray[0] === '') {
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
                    WHERE e.created_at >= '${startDate}' AND e.created_at <= '${endDate}'
                    GROUP BY
                        u.name
                `
            } else if (userOptions.includes('pages_process') && userOptions.includes('segment') && filterUserOptionsArray[0] === '') {
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
                    WHERE e.created_at >= '${startDate}' AND e.created_at <= '${endDate}'
                    GROUP BY
                        u.segment
                `
            } else if (userOptions.includes('doc_type') && userOptions.includes('segment') && filterUserOptionsArray[0] === '') {
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
                    WHERE e.created_at >= '${startDate}' AND e.created_at <= '${endDate}'
                    GROUP BY
                        u.segment
                `
            } else if (userOptions.includes('created_at') && userOptions.includes('pages_process') && filterUserOptionsArray[0] === '') {
                query = `
                    SELECT 
                        TO_CHAR(DATE_TRUNC('day', created_at), 'DD/MM/YYYY') AS "Data de Criação",
                        SUM(pages_process) AS "Páginas Processadas",
                        (SELECT SUM(e2.pages_process) FROM extracts e2 WHERE e2.created_at <= e.created_at) AS "Páginas Acumulativas"
                    FROM 
                        extracts AS e
                    WHERE 
                        e.created_at >= '${startDate}' AND e.created_at <= '${endDate}'
                    GROUP BY 
                        e.created_at
                    ORDER BY 
                        e.created_at
                `
            } else if (userOptions.includes('pages_process') && userOptions.includes('doc_type') && filterUserOptionsArray[0] === 'avg') {
                query = `
                    SELECT 
                        ROUND(avg(e.pages_process),2)        AS "Páginas Processadas",
                        CASE
                            WHEN e.doc_type = 'CNH' THEN UPPER(e.doc_type)
                            WHEN e.doc_type = 'POSICAO_CONSOLIDADA' THEN REPLACE(e.doc_type, 'POSICAO_CONSOLIDADA', 'Posição Consolidada')
                            WHEN e.doc_type = 'FATURA_ENERGIA' THEN REPLACE(e.doc_type, 'FATURA_ENERGIA', 'Fatura de Energia')
                            WHEN e.doc_type = 'DECLARACAO_IR' THEN REPLACE(e.doc_type, 'DECLARACAO_IR', 'Declaração de Imposto de Renda')
                            WHEN e.doc_type = 'COMPROVANTE_RESIDENCIA' THEN REPLACE(e.doc_type, 'COMPROVANTE_RESIDENCIA', 'Comprovante de Residência')
                            WHEN e.doc_type = 'BALANCO_PATRIMONIAL' THEN REPLACE(e.doc_type, 'BALANCO_PATRIMONIAL', 'Balanço Patrimonial')
                            ELSE REPLACE(INITCAP(e.doc_type), '_', ' ')
                        END AS "Tipo de Documento"
                    FROM 
                        extracts AS e
                    WHERE e.created_at >= '${startDate}' AND e.created_at <= '${endDate}'
                    GROUP BY
                        e.doc_type
                `
            } else if (userOptions.includes('pages_process') && userOptions.includes('segment') && filterUserOptionsArray[0] === 'avg') {
                query = `
                    SELECT 
                        ROUND(avg(e.pages_process),2)        AS "Páginas Processadas",
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
                    WHERE e.created_at >= '${startDate}' AND e.created_at <= '${endDate}'
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
                    WHERE e.created_at >= '${startDate}' AND e.created_at <= '${endDate}'
                    GROUP BY e.doc_type
                `;
            }

            return this.extractsService.executarConsulta(query);
        } catch (error) {
            console.error('Erro ao executar consulta:', error);
        }
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
        `;
        return this.extractsService.serv_getColumns(query);
    }

}
