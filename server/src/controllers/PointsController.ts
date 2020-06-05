import {Request, Response} from 'express';
import knex from '../database/connection';

class PointsController{
    async index(request: Request, response: Response){
        const {cidade, uf, itens} = request.query;

        const parsedItens = String(itens).split(',').map(item => Number(item.trim()));

        try {
            const pontos = await knex('pontos')
                .join('pontos_itens', 'pontos.id', '=', 'pontos_itens.id_ponto')
                .whereIn('pontos_itens.id_item', parsedItens)
                .where('cidade', String(cidade))
                .where('uf', String(uf))
                .distinct()
                .select('pontos.*');

            const pontosSerializado = pontos.map(ponto => {
                return {
                    ...ponto,
                    url_imagem: `http://192.168.0.7:3333/uploads/${ponto.imagem}`,
                };
            });

            return response.json(pontosSerializado);
        } catch (error) {
            return response.json([]);
        }
    }


    async show(request: Request, response: Response){
        const {id} = request.params;
        const idNumero = Number(id);        

        const ponto = await knex('pontos').where('id', id).first();

        if (!ponto) {
            return response.status(400).json({mensagem: 'O ponto não foi encontrado.'});
        }

        const pontoSerializado = {
            ...ponto,
            imagem: `http://192.168.0.7:3333/uploads/${ponto.imagem}`,
            
        };
        
        try {
            const itens = await knex('itens')
                .join('pontos_itens', 'itens.id', '=', 'pontos_itens.id_item')
                .where('pontos_itens.id_ponto', id)
                .select('itens.titulo');

            return response.json({ponto: pontoSerializado, itens});
        } catch (error) {            
            return response.json([]);
        }
        
    }

    async create (request: Request, response: Response) {
        const {
            nome,
            email,
            whatsapp,
            latitude,
            longitude,
            uf,
            cidade,
            itens
        } = request.body;
    
        const trx = await knex.transaction();

        try {
            const ponto = {
                imagem: request.file.filename,
                nome,
                email,
                whatsapp,
                latitude,
                longitude,
                uf,
                cidade,
            }
        
            const insertedIds = await trx('pontos').insert(ponto);
        
            const id_ponto = insertedIds[0];
        
            const pontoItens = itens
                .split(',')
                .map((item: string) => Number(item.trim()))
                .map((id_item: number) => {
                return{
                    id_item,
                    id_ponto,
                };
            })
        
            await trx('pontos_itens').insert(pontoItens);
        
            await trx.commit();
            
            return response.json({
                id: id_ponto,
                ...ponto,
            });

        } catch (error) {
            return response.json({erro: "Erro de id"})
        }   

    }
}

export default PointsController;