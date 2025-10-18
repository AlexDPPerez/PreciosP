// backend/src/app.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { initDB } from "./config/database.js";
import ingredientesRoutes from "./routes/IngredientesRoutes.js";
import medidasRoutes from "./routes/medidasRoutes.js";
import productosRoutes from "./routes/ProductosRoutes.js";
import gastosRoutes from "./routes/GastosRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../vistas"));

const db = await initDB();
app.set("db", db);

// RUTAS API (si quieres evitar colisiones recomienda prefijar con /api)
app.use("/api/ingredientes", ingredientesRoutes);
app.use("/api/medidas", medidasRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/gastos", gastosRoutes);

// RUTA CORRECTA A DIST (server está en backend/src, dist en backend/dist)
const distPath = path.join(__dirname, "..", "dist");

// Servir estáticos PRIMERO
app.use(express.static(distPath));

// fallback SPA — sólo si NO es API
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next(); // permite que /api/* devuelva 404 si no existe
  res.sendFile(path.join(distPath, "index.html"));
});

// Fallback SPA — sólo después de static y rutas API
app.use((req, res, next) => {
  // Evitar interceptar APIs si no quieres que el frontend responda índices para esas rutas
  if (
    req.path.startsWith("/api") ||
    req.path.startsWith("/ingredientes") ||
    req.path.startsWith("/medidas") ||
    req.path.startsWith("/productos")
  ) {
    return next();
  }
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) next(err);
  });
});

export default app;
