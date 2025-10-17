import express from "express"
import { 
    getProductos, 
    addProducto, 
    getProductoById, 
    updateProducto, 
    deleteProducto 
} from "../controllers/ProductosController.js"

const router = express.Router()

router.get("/", getProductos)
router.post("/", addProducto)

router.get("/:id", getProductoById)
router.put("/:id", updateProducto)
router.delete("/:id", deleteProducto)

export default router