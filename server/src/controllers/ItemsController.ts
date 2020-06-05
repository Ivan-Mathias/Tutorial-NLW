import {Request, Response} from 'express';
import knex from '../database/connection';


class ItemsController {
    async index(request: Request, response: Response) {
        try {
            const itens = await knex('itens').select('*');
    
            const itemSerializado = itens.map(item => {
                return {
                    id: item.id,
                    titulo: item.titulo,
                    url_imagem: `http://192.168.0.7:3333/uploads/${item.imagem}`,
                };
            })
        
            return response.json(itemSerializado);

        } catch (error) {
            return response.json([]);
        }
    }
}

export default ItemsController;