import db from "../config/db.js"; // Recuerda poner el .js si estás usando "type": "module"

class UserPreference {
    
    // Crear o actualizar las preferencias del usuario
    static async upsert(userId, preferences = {}) {
        const {
            dietary_restrictions = [],
            allergies = [],
            preferred_cuisines = [],
            default_services = 4,      // Cambiado a default_services para coincidir con tu SQL
            measurement_unit = "metric"
        } = preferences;

        const queryText = `
            INSERT INTO users_preferences (
                user_id, dietary_restrictions, allergies, preferred_cuisines, default_services, measurement_unit
            ) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                dietary_restrictions = $2, 
                allergies = $3, 
                preferred_cuisines = $4,
                default_services = $5, 
                measurement_unit = $6 
            RETURNING *;
        `;

        const values = [
            userId, 
            dietary_restrictions, 
            allergies, 
            preferred_cuisines, 
            default_services, 
            measurement_unit
        ];

        const result = await db.query(queryText, values);
        return result.rows[0]; // Corregido: .rows con 's' al final
    }

    // Buscar preferencias por el ID del usuario
    static async findByUserId(userId) { // Corregido: findByUserId
        const result = await db.query(
            "SELECT * FROM users_preferences WHERE user_id = $1", 
            [userId]
        );
        return result.rows[0]; // Corregido: result.rows
    }

    // Eliminar preferencias
    static async delete(userId) {
        await db.query(
            "DELETE FROM users_preferences WHERE user_id = $1", 
            [userId]
        );
        return true;
    }
}

export default UserPreference;