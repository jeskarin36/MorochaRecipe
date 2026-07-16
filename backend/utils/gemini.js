import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
    console.error("WARNING: GEMINI_API_KEY is not set");
}

export const generateRecipe = async ({ ingredients, dietaryRestrictions = [], cuisineType = 'any', serving = 4, cookingTime = 'medium' }) => {
    const dietaryInfo = dietaryRestrictions.length > 0 ? `Restricciones alimenticias: ${dietaryRestrictions.join(', ')}` : "Sin restricciones alimenticias";

    const timeGuide = {
        quick: "Menos de 30 minutos",
        medium: "30-60 minutos",
        long: "Más de 60 minutos"
    };

    // Prompt en español indicando que genere el contenido en español
    const prompt = `Genera una receta detallada en ESPAÑOL con los siguientes requisitos:
    Ingredientes disponibles: ${ingredients.join(', ')}
    ${dietaryInfo}
    Tipo de cocina: ${cuisineType}
    Porciones: ${serving}
    Tiempo de cocción: ${timeGuide[cookingTime] || 'cualquiera'}

    Por favor, proporciona la receta completa estructurada exactamente en este formato JSON. 
    ¡IMPORTANTE!: Las claves del JSON deben mantenerse en inglés como se muestra abajo, pero todos los valores (nombres, descripciones, instrucciones, tips) DEBEN estar escritos en ESPAÑOL.
    
    {
        "name": "Nombre de la receta en español",
        "description": "Breve descripción del plato en español",
        "cuisineType": "${cuisineType}",
        "difficulty": "easy, medium o hard",
        "prepTime": número (en minutos),
        "cookTime": número (en minutos),
        "serving": ${serving},
        "ingredients": [{"name": "nombre del ingrediente en español", "quantity": número, "unit": "unidad de medida en español"}],
        "instructions": [
            "Paso 1 en español",
            "Paso 2 en español"
        ],
        "dietaryTags": ["vegetarian", "gluten-free", "etc"],
        "nutrition": {
            "calories": número,
            "protein": número,
            "carbs": número,
            "fats": número,
            "fiber": número
        },
        "cookingTips": ["Consejo 1 en español", "Consejo 2 en español"]
    }`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                // Forzamos a Gemini a responder estrictamente en formato JSON puro
                responseMimeType: "application/json"
            }
        });

        // Al usar responseMimeType, ya viene el JSON limpio sin los ```json
        return JSON.parse(response.text.trim());
        
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Failed to generate recipe. Please try again.");
    }
};

export const generatePantrySuggestions = async (pantryItems, expiringItems = []) => {
    const ingredients = pantryItems.map(item => item.name).join(', ');
    const expiringText = expiringItems.length > 0 ? `\nIngredientes prioritarios (vencen pronto): ${expiringItems.join(', ')}` : '';

    const prompt = `Basándote en estos ingredientes disponibles: ${ingredients}${expiringText}
    
    Sugiere 3 ideas creativas de recetas que utilicen estos ingredientes. 
    Devuelve ÚNICAMENTE un array de strings en formato JSON en ESPAÑOL: ["Idea de receta 1", "Idea de receta 2", "Idea de receta 3"]
    Cada sugerencia debe ser una descripción breve y apetitosa de 1 o 2 frases en español.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        return JSON.parse(response.text.trim());

    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Failed to generate Suggestion.");
    }
};

export const generateCookingTips = async (recipe) => {
    const prompt = `Para esta receta: "${recipe.name}" 
    Ingredientes: ${recipe.ingredients?.map(i => i.name).join(', ') || "N/A"}

    Proporciona de 3 a 5 consejos de cocina útiles en ESPAÑOL para mejorar esta receta. 
    Devuelve ÚNICAMENTE un array de strings en formato JSON: ["Consejo 1", "Consejo 2", "Consejo 3"]`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        return JSON.parse(response.text.trim());
        
    } catch (error) {
        console.error("Gemini API error:", error);
        // Ojo: tenías un typo aquí ("retrun") que crasheaba el catch, ya corregido:
        return ["Cocina con amor y paciencia"];
    }
};

export default {
    generateRecipe,
    generatePantrySuggestions,
    generateCookingTips
};