import { Controller, Get, Query } from '@nestjs/common';
import { ExtractsService } from '../services/extracts.service';

@Controller('data')
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
    async consultarOpcoes(@Query() userOptions: any) {
        console.log('testenovo', userOptions);

        let query: string = '';

        userOptions.selectedOptions = userOptions.selectedOptions.split(',');

        try {
            if (userOptions.selectedOptions.includes('pages_process') && userOptions.selectedOptions.includes('doc_type') && userOptions.aggregate === 'sum') {
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
                    WHERE e.created_at >= '${userOptions.startDate}' AND e.created_at <= '${userOptions.endDate}'
                    GROUP BY e.doc_type
                `;
            } else if (userOptions.selectedOptions.includes('doc_count') && userOptions.selectedOptions.includes('name') && userOptions.aggregate === '') {
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
                    WHERE e.created_at >= '${userOptions.startDate}' AND e.created_at <= '${userOptions.endDate}}'
                    GROUP BY
                        u.name
                `
            } else if (userOptions.selectedOptions.includes('pages_process') && userOptions.selectedOptions.includes('name') && userOptions.aggregate === 'sum') {
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
                    WHERE e.created_at >= '${userOptions.startDate}' AND e.created_at <= '${userOptions.endDate}}'
                    GROUP BY
                        u.name
                `
            } else if (userOptions.selectedOptions.includes('pages_process') && userOptions.selectedOptions.includes('segment') && userOptions.aggregate === 'sum') {
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
                    WHERE e.created_at >= '${userOptions.startDate}' AND e.created_at <= '${userOptions.endDate}}'
                    GROUP BY
                        u.segment
                `
            } else if (userOptions.selectedOptions.includes('doc_count') && userOptions.selectedOptions.includes('segment') && userOptions.aggregate === '') {
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
                    WHERE e.created_at >= '${userOptions.startDate}' AND e.created_at <= '${userOptions.endDate}}'
                    GROUP BY
                        u.segment
                `
            } else if (userOptions.selectedOptions.includes('created_at') && userOptions.selectedOptions.includes('pages_process') && userOptions.aggregate === 'sum') {
                query = `
                    SELECT 
                        TO_CHAR(DATE_TRUNC('day', created_at), 'DD/MM/YYYY') AS "Data de Criação",
                        SUM(pages_process) AS "Páginas Processadas",
                        (SELECT SUM(e2.pages_process) FROM extracts e2 WHERE e2.created_at <= e.created_at) AS "Páginas Acumulativas"
                    FROM 
                        extracts AS e
                    WHERE 
                        e.created_at >= '${userOptions.startDate}' AND e.created_at <= '${userOptions.endDate}}'
                    GROUP BY 
                        e.created_at
                    ORDER BY 
                        e.created_at
                `
            } else if (userOptions.selectedOptions.includes('pages_process') && userOptions.selectedOptions.includes('doc_type') && userOptions.aggregate === 'avg') {
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
                    WHERE e.created_at >= '${userOptions.startDate}' AND e.created_at <= '${userOptions.endDate}}'
                    GROUP BY
                        e.doc_type
                `
            } else if (userOptions.selectedOptions.includes('pages_process') && userOptions.selectedOptions.includes('segment') && userOptions.aggregate === 'avg') {
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
                    WHERE e.created_at >= '${userOptions.startDate}' AND e.created_at <= '${userOptions.endDate}}'
                    GROUP BY
                        u.segment
                `
            } else if (userOptions.selectedOptions.includes('doc_type') && userOptions.selectedOptions.includes('doc_count') && userOptions.aggregate === '') {
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
                    WHERE e.created_at >= '${userOptions.startDate}' AND e.created_at <= '${userOptions.endDate}}'
                    GROUP BY e.doc_type
                `
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
    async getColumns(@Query('tableOption') tableOption: string) {
        const query = `
        SELECT 
            column_name
        FROM 
            information_schema.columns
        WHERE 
            table_schema = 'public'
        AND
            table_name = '${tableOption}';
        `;
        return this.extractsService.serv_getColumns(query);
    }

}
