import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// 🚨 DIAGNÓSTICO: Imprimimos en la terminal si la variable realmente llegó al archivo
if (!process.env.DATABASE_URL) {
    console.error("❌ ¡ALERTA CRÍTICA!: La variable DATABASE_URL está vacía o no se está leyendo en db.js");
} else {
    console.log("🔗 DATABASE_URL detectada correctamente.");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Forzamos SSL ya que Neon lo requiere obligatoriamente para conectar
    ssl: { rejectUnauthorized: false }
});

pool.on("connect", () => {
    console.log("🔋 ¡Conexión establecida con éxito en la nube de Neon!");
});

pool.on("error", (err) => {
    console.error("❌ Error inesperado en el pool de la base de datos:", err.message);
});

export default pool;
