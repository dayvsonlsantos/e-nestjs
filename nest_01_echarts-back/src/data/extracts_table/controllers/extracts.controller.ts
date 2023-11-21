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

        console.log(userOptions.specificFilter)
        console.log(userOptions.cardValueID)

        let query: string = '';

        userOptions.selectedOptions = userOptions.selectedOptions.split(',');

        let datePattern = 'MM/YY';

        switch (userOptions.timeGrouping) {
            case 'day':
                datePattern = 'DD/MM/YY';
                break;
            case 'month':
                datePattern = 'MM/YY';
                break;
            case 'year':
                datePattern = 'YY';
                break;
        }

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
                    JOIN
                        users AS u
                    ON
                        u.id = e.user_id
                    WHERE ((e.created_at >= '${userOptions.startDate}') AND (e.created_at <= '${userOptions.endDate}')) AND ${userOptions.specificFilter}
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
                        WHERE ((e.created_at >= '${userOptions.startDate}') AND (e.created_at <= '${userOptions.endDate}')) AND ${userOptions.specificFilter}
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
                    WHERE ((e.created_at >= '${userOptions.startDate}') AND (e.created_at <= '${userOptions.endDate}')) AND ${userOptions.specificFilter}
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
                            ELSE INITCAP(u.segment)
                        END AS "Segmento"
                    FROM 
                        extracts AS e
                    JOIN
                        users AS u
                    ON
                        u.id = e.user_id
                    WHERE ((e.created_at >= '${userOptions.startDate}') AND (e.created_at <= '${userOptions.endDate}')) AND ${userOptions.specificFilter}
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
                            ELSE INITCAP(u.segment)
                        END AS "Segmento"
                    FROM 
                        extracts AS e
                    JOIN
                        users AS u
                    ON
                        u.id = e.user_id
                    WHERE ((e.created_at >= '${userOptions.startDate}') AND (e.created_at <= '${userOptions.endDate}')) AND ${userOptions.specificFilter}
                    GROUP BY
                        u.segment
                `
            } else if (userOptions.selectedOptions.includes('created_at') && userOptions.selectedOptions.includes('pages_process') && userOptions.aggregate === 'sum') {

                query = `
                    SELECT 
                        truncated_date AS "Data de Criação",
                        SUM(pages_process) OVER (ORDER BY truncated_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS "Páginas Acumulativas"
                    FROM (
                        SELECT 
                            TO_CHAR(DATE_TRUNC('${userOptions.timeGrouping}', e.created_at), '${datePattern}') AS truncated_date,
                            SUM(e.pages_process) AS pages_process
                        FROM 
                            extracts as e
                        JOIN
                            users AS u ON u.id = e.user_id
                        WHERE 
                            ((e.created_at >= '${userOptions.startDate}') AND (e.created_at <= '${userOptions.endDate}')) AND ${userOptions.specificFilter}
                        GROUP BY 
                            DATE_TRUNC('${userOptions.timeGrouping}', e.created_at)
                    ) AS subquery
                    ORDER BY 
                        truncated_date;
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
                    JOIN
                        users AS u
                    ON
                        u.id = e.user_id
                    WHERE ((e.created_at >= '${userOptions.startDate}') AND (e.created_at <= '${userOptions.endDate}')) AND ${userOptions.specificFilter}
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
                            ELSE INITCAP(u.segment)
                        END AS "Segmento"
                    FROM 
                        extracts AS e
                    JOIN
                        users AS u
                    ON
                        u.id = e.user_id
                    WHERE ((e.created_at >= '${userOptions.startDate}') AND (e.created_at <= '${userOptions.endDate}')) AND ${userOptions.specificFilter}
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
                    JOIN
                        users AS u
                    ON
                        u.id = e.user_id
                    WHERE ((e.created_at >= '${userOptions.startDate}') AND (e.created_at <= '${userOptions.endDate}')) AND ${userOptions.specificFilter}
                    GROUP BY e.doc_type
                `
            } else if (userOptions.selectedOptions.includes('only_doc_count') && userOptions.aggregate === '') {
                query = `
                    SELECT 
                        count(e.doc_type)       AS "Documentos processados"
                    FROM 
                        extracts AS e
                    JOIN
                        users AS u
                    ON
                        u.id = e.user_id
                    WHERE ((e.created_at >= '${userOptions.startDate}') AND (e.created_at <= '${userOptions.endDate}')) AND ${userOptions.specificFilter}
                `
            } else if (userOptions.selectedOptions.includes('only_pages_process') && userOptions.aggregate === 'sum') {
                query = `
                    SELECT 
                        sum(e.pages_process)        AS "Páginas Processadas"
                    FROM 
                        extracts AS e
                    JOIN
                        users AS u
                    ON
                        u.id = e.user_id
                    WHERE ((e.created_at >= '${userOptions.startDate}') AND (e.created_at <= '${userOptions.endDate}')) AND ${userOptions.specificFilter}
                `
            } else if (userOptions.selectedOptions.includes('only_pages_process') && userOptions.aggregate === 'avg') {
                query = `
                    SELECT 
                        ROUND(avg(e.pages_process),2)        AS "Páginas Processadas"
                    FROM 
                        extracts AS e
                    JOIN
                        users AS u
                    ON
                        u.id = e.user_id
                    WHERE ((e.created_at >= '${userOptions.startDate}') AND (e.created_at <= '${userOptions.endDate}')) AND ${userOptions.specificFilter}
                `
            } else if (userOptions.selectedOptions.includes('most_analyzed_doc') && userOptions.aggregate === '') {
                query = `
                    SELECT 
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
                    JOIN
                        users AS u
                    ON
                        u.id = e.user_id
                    WHERE ((e.created_at >= '${userOptions.startDate}') AND (e.created_at <= '${userOptions.endDate}')) AND ${userOptions.specificFilter}
                    GROUP BY
                        e.doc_type
                    ORDER BY
                        count(e.doc_type) desc
                    LIMIT 1
                `
            } else if (userOptions.selectedOptions.includes('doc_most_analyzed_pages') && userOptions.aggregate === 'sum') {
                query = `
                    SELECT 
                        sum(e.pages_process),
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
                    JOIN
                        users AS u
                    ON
                        u.id = e.user_id
                    WHERE ((e.created_at >= '${userOptions.startDate}') AND (e.created_at <= '${userOptions.endDate}')) AND ${userOptions.specificFilter}
                        e.doc_type
                    ORDER BY
                        sum(e.pages_process) desc
                    LIMIT 1                    
                `
            } else if (userOptions.selectedOptions.includes('user_most_analyzed_doc') && userOptions.aggregate === '') {
                query = `
                SELECT 
                    u.name                  AS "Usuário"
                FROM 
                    extracts AS e
                JOIN
                    users AS u
                ON
                    u.id = e.user_id
                WHERE ((e.created_at >= '${userOptions.startDate}') AND (e.created_at <= '${userOptions.endDate}')) AND ${userOptions.specificFilter}
                GROUP BY
                    u.name
                ORDER BY
                    count(e.doc_type) DESC
                LIMIT 1
                `
            } else if (userOptions.selectedOptions.includes('user_most_analyzed_pages') && userOptions.aggregate === 'sum') {
                query = `
                    SELECT 
                        u.name                  AS "Usuário"
                    FROM 
                        extracts AS e
                    JOIN
                        users AS u
                    ON
                        u.id = e.user_id
                    WHERE ((e.created_at >= '${userOptions.startDate}') AND (e.created_at <= '${userOptions.endDate}')) AND ${userOptions.specificFilter}
                    GROUP BY
                        u.name
                    ORDER BY
                        sum(e.pages_process) DESC
                    LIMIT 1
                `
            } else if (userOptions.selectedOptions.includes('segment_most_analyzed_doc') && userOptions.aggregate === '') {
                query = `
                SELECT 
                    CASE
                        WHEN u.segment = 'imobiliaria' THEN REPLACE (u.segment, 'imobiliaria', 'Imobiliária')
                        WHEN u.segment = 'construtora' THEN INITCAP (u.segment)
                        WHEN u.segment = 'financeira' THEN INITCAP (u.segment)
                        WHEN u.segment = 'banco' THEN INITCAP (u.segment)
                        ELSE INITCAP(u.segment)
                    END AS "Segmento"
                FROM 
                    extracts AS e
                JOIN
                    users AS u
                ON
                    u.id = e.user_id
                WHERE ((e.created_at >= '${userOptions.startDate}') AND (e.created_at <= '${userOptions.endDate}')) AND ${userOptions.specificFilter}
                GROUP BY
                    u.segment
                ORDER BY
                    count(e.doc_type) DESC
                LIMIT 1
                `
            } else if (userOptions.selectedOptions.includes('segment_most_analyzed_pages') && userOptions.aggregate === 'sum') {
                query = `
                    SELECT 
                        CASE
                            WHEN u.segment = 'imobiliaria' THEN REPLACE (u.segment, 'imobiliaria', 'Imobiliária')
                            WHEN u.segment = 'construtora' THEN INITCAP (u.segment)
                            WHEN u.segment = 'financeira' THEN INITCAP (u.segment)
                            WHEN u.segment = 'banco' THEN INITCAP (u.segment)
                            ELSE INITCAP(u.segment)
                        END AS "Segmento"
                    FROM 
                        extracts AS e
                    JOIN
                        users AS u
                    ON
                        u.id = e.user_id
                    WHERE ((e.created_at >= '${userOptions.startDate}') AND (e.created_at <= '${userOptions.endDate}')) AND ${userOptions.specificFilter}
                    GROUP BY
                        u.segment
                    ORDER BY
                        sum(e.pages_process) DESC
                    LIMIT 1
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
        return this.extractsService.executarConsulta(query);
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
        return this.extractsService.executarConsulta(query);
    }

    @Get('/getUsers')
    async getUsers() {
        const query = `
            SELECT 
                INITCAP(name) as column_name
            FROM 
                users
            GROUP BY users.name
        `;
        return this.extractsService.executarConsulta(query);
    }

    @Get('/getSegments')
    async getSegments() {
        const query = `
            SELECT 
                INITCAP(segment) as column_name
            FROM 
                users
            GROUP BY users.segment
        `;
        return this.extractsService.executarConsulta(query);
    }

    @Get('/getDocTypes')
    async getDocTypes() {
        const query = `
            SELECT 
                CASE
                    WHEN e.doc_type = 'CNH' THEN UPPER(e.doc_type)
                    WHEN e.doc_type = 'POSICAO_CONSOLIDADA' THEN REPLACE(e.doc_type, 'POSICAO_CONSOLIDADA', 'Posição Consolidada')
                    WHEN e.doc_type = 'FATURA_ENERGIA' THEN REPLACE(e.doc_type, 'FATURA_ENERGIA', 'Fatura de Energia')
                    WHEN e.doc_type = 'DECLARACAO_IR' THEN REPLACE(e.doc_type, 'DECLARACAO_IR', 'Declaração de Imposto de Renda')
                    WHEN e.doc_type = 'COMPROVANTE_RESIDENCIA' THEN REPLACE(e.doc_type, 'COMPROVANTE_RESIDENCIA', 'Comprovante de Residência')
                    WHEN e.doc_type = 'BALANCO_PATRIMONIAL' THEN REPLACE(e.doc_type, 'BALANCO_PATRIMONIAL', 'Balanço Patrimonial')
                    ELSE REPLACE(INITCAP(e.doc_type), '_', ' ')
                END AS column_name
            FROM 
                extracts as e
            GROUP BY e.doc_type
        `;
        return this.extractsService.executarConsulta(query);
    }

}
