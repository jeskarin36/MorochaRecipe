import MealPlan from "../models/MealPlan.js";

export const addToMealPlan = async (req, res, next) => {
    try {
        const mealPlan = await MealPlan.create(req.user.id, req.body);

        res.status(201).json({
            success: true,
            message: "Recipe added to meal plan",
            data: { mealPlan }
        });
    } catch (error) {
        next(error);
    }
}

export const getWeeklyMealPlan = async (req, res, next) => {
    try {
        const { start_date, weekStartDate } = req.query;
        // Corregido: removido el 'await' innecesario de una expresión síncrona
        const startDate = start_date || weekStartDate;

        if (!startDate) {
            return res.status(400).json({
                success: false,
                message: "Please provide start_date or weekStartDate",
            });
        }

        // Corregido: Cambiado de getWeeklyMealPlan a getWeeklyPlan para coincidir con el modelo
        const mealPlans = await MealPlan.getWeeklyPlan(req.user.id, startDate);

        res.json({
            success: true,
            data: { mealPlans }
        });
    } catch (error) {
        next(error);
    }
}

export const getUpcomingMeals = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const meals = await MealPlan.getUpcoming(req.user.id, limit);

        res.json({
            success: true,
            data: { meals }
        });
    } catch (error) {
        next(error);
    }
}

export const deleteMealPlan = async (req, res, next) => {
    try {
        const { id } = req.params;
        const mealPlan = await MealPlan.delete(id, req.user.id);

        if (!mealPlan) {
            return res.status(404).json({
                success: false,
                message: "Meal plan entry not found",
            });
        }

        res.json({
            success: true,
            message: "Meal plan entry deleted successfully",
            data: { mealPlan }
        });
    } catch (error) {
        next(error);
    }
}

// Corregido opcionalmente el nombre de la función para buena práctica (getMealPlanStats)
export const getMealPlanStarts = async (req, res, next) => {
    try {
        // Corregido: Cambiado de getStats a getStatus para coincidir con el modelo
        const stats = await MealPlan.getStatus(req.user.id);

        res.json({
            success: true,
            data: { stats }
        });
    } catch (error) {
        next(error);
    }
}