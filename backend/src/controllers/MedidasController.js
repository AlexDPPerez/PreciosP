import { Medidas } from "../models/Medidas.js";

export const getMedidas = async (req,res) => {
    const db = req.app.get('db');
    const medidasModel = new Medidas(db);
    try{
        const data = await medidasModel.getAll();
        // AHORA: Envías los datos como JSON. React se encargará de mostrarlos.
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener las medidas." });
    }
}

export const seedMedidas = async (req, res) => {
    const db = req.app.get("db");
    const medidasModel = new Medidas(db)
    try{
        await medidasModel.seed()
        res.status(201).json({ message: "Medidas agregadas" });
    } catch (error) {
        res.status(500).json({ error: "Error al añadir las medidas" });

    }
}
