import express from 'express';
import {celebrate, Joi} from 'celebrate';

import multer from 'multer';
import multerConfig from './config/multer';

import PointsController from './controllers/PointsController';
import ItensController from './controllers/ItemsController';

// Index, Show, Create, Update, Delete
const routes = express.Router();
const upload = multer(multerConfig);

const pointsController = new PointsController();
const itensController = new ItensController();

routes.get('/itens', itensController.index);
routes.get('/ponto', pointsController.index);
routes.get('/ponto/:id', pointsController.show);

routes.post(
    '/ponto', 
    upload.single('imagem'),
    celebrate({
        body: Joi.object().keys({
            nome: Joi.string().required(),
            email: Joi.string().required(),
            whatsapp: Joi.number().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            uf: Joi.string().required().max(2),
            cidade: Joi.string().required(),
            itens: Joi.string().required(),
        })
    }, {
        abortEarly: false,
    }),
    pointsController.create
);

export default routes;