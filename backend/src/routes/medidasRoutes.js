import express from "express"
import { getMedidas, seedMedidas } from "../controllers/MedidasController.js"

const router = express.Router()

router.get("/", getMedidas)
router.get("/seed", seedMedidas) // Cambiado de POST a GET temporalmente

export default router