import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { initDB } from "./config/database.js";
import ingredientesRoutes from "./routes/IngredientesRoutes.js";
import medidasRoutes from "./routes/medidasRoutes.js"
import productosRoutes from "./routes/ProductosRoutes.js"



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
// middleware para parsear los datos de formularios
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos de React
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../vistas"));

const db = await initDB();
app.set("db", db);

// 2. Usar las rutas del dashboard para la raíz y las de ingredientes para su path
app.use("/ingredientes", ingredientesRoutes);
app.use("/medidas", medidasRoutes)
app.use("/productos", productosRoutes)

export default app;
