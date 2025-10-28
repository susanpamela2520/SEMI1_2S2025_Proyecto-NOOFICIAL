import express from "express";
import dotenv from "dotenv";
import pool from "./db.js";
import usersRouter from "./routes/users.js"
import cors from "cors";

dotenv.config()
const app = express()

// Configuración de CORS para desarrollo
const corsOptions = {
  origin: true,              // permite cualquier origen (refleja el request)
  credentials: true,         // permite envío de cookies / headers de autenticación
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // métodos permitidos
  allowedHeaders: ["Content-Type", "Authorization"],     // cabeceras permitidas
  optionsSuccessStatus: 200  // fallback para navegadores viejos
};

app.use(cors(corsOptions));

//app.use(express.json())
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use("/users", usersRouter);


app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Ruta de prueba conexión DB
app.get("/ping", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() as now");
    res.json({ success: true, now: rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Error en la base de datos" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor escuchando en puerto ${process.env.PORT}`);
});