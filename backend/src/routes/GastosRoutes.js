import express from 'express';
import { getGastos, addGasto, deleteGasto, updateGasto } from '../controllers/GastosController.js';

const router = express.Router();

router.get('/', getGastos);

router.post('/', addGasto);

router.put('/:id', updateGasto);

router.delete('/:id', deleteGasto);

export default router;
