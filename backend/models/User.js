import db from "../config/db.js"; // Recuerda el .js si usas ES Modules ("type": "module")
import bcrypt from "bcryptjs";
import crypto from "crypto";

class User {
    // Crear un nuevo usuario
    static async create({ email, password, name }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 🚀 2. Genera un UUID v4 válido desde Node.js
        const userId = crypto.randomUUID(); 
        
        // 🚀 3. Agrega la columna 'id' y el parámetro $1 a la consulta SQL
        const queryText = `
            INSERT INTO users (id, email, password_hash, name) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, email, name, created_at, updated_at;
        `;
        
        // Pasamos userId como el primer parámetro ($1)
        const result = await db.query(queryText, [userId, email, hashedPassword, name]);
        return result.rows[0];
    }

    // Buscar por Email (Corregido findByEmail)
    static async findByEmail(email) {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        return result.rows[0];
    }

    // Buscar por ID (Corregido findById)
    static async findById(id) {
        const result = await db.query(
            "SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1", 
            [id]
        );
        return result.rows[0];
    }

    // Actualizar perfil (Nombre y/o Email)
    static async update(id, { name, email }) {
        // Corregido: $2 en su posición correcta, variables consistentes y updated_at bien escrito
        const queryText = `
            UPDATE users 
            SET name = COALESCE($1, name), 
                email = COALESCE($2, email) 
            WHERE id = $3 
            RETURNING id, email, name, updated_at;
        `;
        
        const result = await db.query(queryText, [name, email, id]);
        return result.rows[0];
    }

    // Actualizar contraseña
    static async updatePassword(id, newPassword) {
        // Corregido: se usa newPassword que viene del argumento
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [hashedPassword, id]);
        return true;
    }

    // Verificar si la contraseña coincide
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Eliminar usuario
    static async delete(id) {
        await db.query("DELETE FROM users WHERE id = $1", [id]);
        return true;
    }
}

export default User;