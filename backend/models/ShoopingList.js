import db from "../config/db.js";

class ShoopingList {
    static async generateFromMealPlan(userId, startDate, endDate) {
        const client = await db.pool.connect();

        try {
            await client.query("BEGIN");
            await client.query("DELETE FROM shopping_list_items WHERE user_id = $1 AND from_meal_plan = true", [userId]);
              
            const result = await client.query(
                "SELECT ri.ingredient_name, ri.unit, SUM(ri.quantity) as total_quantity FROM meal_plans mp JOIN recipe_ingredient_name ri ON mp.recipe_id = ri.recipe_id WHERE mp.user_id = $1 AND mp.meal_date >= $2 AND mp.meal_date <= $3 GROUP BY ri.ingredient_name, ri.unit",
                [userId, startDate, endDate]
            );

            const ingredients = result.rows;
            const pantryResult = await client.query("SELECT name, quantity, unit FROM pantry_items WHERE user_id = $1", [userId]);

            const pantryMap = new Map();
            pantryResult.rows.forEach(item => {
                const key = `${item.name.toLowerCase()}_${item.unit}`;
                // 🛠️ CORREGIDO: item.quantity era una propiedad, no una función. Quitados los paréntesis ()
                pantryMap.set(key, item.quantity); 
            });

            for (const ing of ingredients) {
                // 🛠️ CORREGIDO: quitado un espacio en blanco oculto al final del string de la clave
                const key = `${ing.ingredient_name.toLowerCase()}_${ing.unit}`;
                const pantryQty = pantryMap.get(key) || 0;
                const needeQty = Math.max(0, parseFloat(ing.total_quantity) - parseFloat(pantryQty));

                if (needeQty > 0) {
                    // 🛠️ CORREGIDO: faltaba una coma antes del array de parámetros en client.query
                    await client.query(
                        "INSERT INTO shopping_list_items (user_id, ingredient_name, quantity, unit, from_meal_plan, category) VALUES($1, $2, $3, $4, true, $5)",
                        [userId, ing.ingredient_name, needeQty, ing.unit, "Uncategorized"]
                    );
                }
            }

            await client.query("COMMIT");
            // 🛠️ CORREGIDO: Corregido typo en el nombre del método (findByUser)
            return await this.findByUser(userId);

        } catch (error) {
             await client.query("ROLLBACK");
             throw error;
        } finally {
            client.release();
        }
    }

    static async create(userId, itemData) {
        const { ingredient_name, quantity, unit, category = "Uncategorized" } = itemData;
        const result = await db.query(
            "INSERT INTO shopping_list_items (user_id, ingredient_name, quantity, unit, category, from_meal_plan) VALUES($1, $2, $3, $4, $5, false) RETURNING *",
            [userId, ingredient_name, quantity, unit, category]
        );
        return result.rows[0];
    }

    static async findByUser(userId) {
        const result = await db.query("SELECT * FROM shopping_list_items WHERE user_id = $1 ORDER BY category, ingredient_name", [userId]);
        return result.rows;
    }

    static async getGroupByCategory(userId) {
        // 🛠️ CORREGIDO: Decía 'son_build_object' en vez de 'json_build_object'
        const result = await db.query(
            "SELECT category, json_agg(json_build_object('id', id, 'ingredient_name', ingredient_name, 'quantity', quantity, 'unit', unit, 'is_checked', is_checked, 'from_meal_plan', from_meal_plan)) as items FROM shopping_list_items WHERE user_id = $1 GROUP BY category ORDER BY category",
            [userId]
        );
        return result.rows;
    }

    static async update(id, userId, updates) {
        const { ingredient_name, quantity, unit, category, is_checked } = updates;
        // 🛠️ CORREGIDO: Decía 6$ y 7$ en lugar de $6 y $7
        const result = await db.query(
            "UPDATE shopping_list_items SET ingredient_name = COALESCE($1, ingredient_name), quantity = COALESCE($2, quantity), unit = COALESCE($3, unit), category = COALESCE($4, category), is_checked = COALESCE($5, is_checked) WHERE id = $6 AND user_id = $7 RETURNING *",
            [ingredient_name, quantity, unit, category, is_checked, id, userId]
        );
        return result.rows[0];
    }

    static async toggleChecked(id, userId) {
        // 🛠️ CORREGIDO: Decía 1$ y 2$ en lugar de $1 y $2
        const result = await db.query("UPDATE shopping_list_items SET is_checked = NOT is_checked WHERE id = $1 AND user_id = $2 RETURNING *", [id, userId]);
        return result.rows[0];
    }

    static async delete(id, userId) {
        // 🛠️ CORREGIDO: En el segundo parámetro de tu query decía 2$ en vez de $2
        const result = await db.query("DELETE FROM shopping_list_items WHERE id = $1 AND user_id = $2 RETURNING *", [id, userId]);
        return result.rows[0];
    }

    static async clearChecked(userId) {
        // 🛠️ CORREGIDO: Decía 1$ en lugar de $1. Esto causaba el error de tu log.
        const result = await db.query("DELETE FROM shopping_list_items WHERE user_id = $1 AND is_checked = true RETURNING *", [userId]);
        return result.rows;
    }

    static async clearAll(userId) {
        // 🛠️ CORREGIDO: Decía 1$ en lugar de $1
        const result = await db.query("DELETE FROM shopping_list_items WHERE user_id = $1 RETURNING *", [userId]);
        return result.rows;
    }

    static async addCheckedToPantry(userId) {
        const client = await db.pool.connect();
        
        try {
            await client.query("BEGIN");

            // 🛠️ CORREGIDO: Decía 1$ en lugar de $1
            const checkedItems = await client.query("SELECT * FROM shopping_list_items WHERE user_id = $1 AND is_checked = true", [userId]);

            for (const item of checkedItems.rows) {
                await client.query("INSERT INTO pantry_items (user_id, name, quantity, unit, category) VALUES ($1, $2, $3, $4, $5)", [userId, item.ingredient_name, item.quantity, item.unit, item.category]);
            }

            // 🛠️ CORREGIDO: Decía 1$ en lugar de $1
            await client.query("DELETE FROM shopping_list_items WHERE user_id = $1 AND is_checked = true", [userId]);
            await client.query("COMMIT");
            return checkedItems.rows;

        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }
}

export default ShoopingList;