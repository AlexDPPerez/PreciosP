import express from "express"
import { getIngredientes, addIngredientes, updateIngredientes, deleteIngredientes } from "../controllers/IngredientesController.js"

const router = express.Router()

router.get("/", getIngredientes)
router.post("/", addIngredientes)
router.put("/:id", updateIngredientes) // Nueva ruta para actualizar
router.delete('/:id', deleteIngredientes)

export default router