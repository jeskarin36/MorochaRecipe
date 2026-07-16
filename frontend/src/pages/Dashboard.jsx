import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ChefHat, UtensilsCrossed, Calendar, ShoppingCart, TrendingUp, Clock } from 'lucide-react';
import api from "../services/api.js";

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalRecipes: 0,
        pantryItems: 0,
        mealsThisWeek: 0
    });
    const [recentRecipes, setRecentRecipes] = useState([]);
    const [upcomingMeals, setUpcomingMeals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // CORREGIDO: Eliminada la petición duplicada a /recipes/stats para emparejar con las variables
            const [recipesRes, pantryRes, mealPlanRes, recentRes, upcomingRes] = await Promise.all([
                api.get("/recipes/stats"),
                api.get("/pantry/stats"),
                api.get("/meal-plans/stats"),
                api.get("/recipes/recent?limit=5"),
                api.get("/meal-plans/upcoming?limit=5"),
            ]);

            setStats({
                totalRecipes: recipesRes.data?.data?.stats?.total_reicpes || 0,
                pantryItems: pantryRes.data?.data?.stats?.total_items || 0,
                mealsThisWeek: mealPlanRes.data?.data?.stats?.this_week_count || 0
            });

            setRecentRecipes(recentRes.data?.data?.recipes || []);
            setUpcomingMeals(upcomingRes.data?.data?.meals || []);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className='min-h-screen bg-gray-50'>
                <Navbar />
                <div className='flex items-center justify-center h-96'>
                    <div className='w-8 h-8 border-emerald-500 border-t-transparent rounded-full animate-spin'></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
                    <p className="text-gray-600 mt-1">¡Te damos la bienvenida! Este es el resumen de tu cocina</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        icon={<ChefHat className="w-6 h-6" />}
                        label="Total de Recetas"
                        value={stats.totalRecipes}
                        color="emerald"
                    />
                    <StatCard
                        icon={<UtensilsCrossed className="w-6 h-6" />}
                        label="Artículos en Despensa"
                        value={stats.pantryItems}
                        color="blue"
                    />
                    <StatCard
                        icon={<Calendar className="w-6 h-6" />}
                        label="Comidas esta Semana"
                        value={stats.mealsThisWeek}
                        color="purple"
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Link
                        to="/generate"
                        className="bg-linear-to-r from-emerald-50 to-emerald-100 text-emerald-500 p-6 rounded-xl shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ChefHat className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-emerald-900">Generar Receta</h3>
                                <p className="text-emerald-800 text-sm">Crea recetas personalizadas con IA</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/pantry"
                        className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <UtensilsCrossed className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">Gestionar Despensa</h3>
                                <p className="text-gray-600 text-sm">Agrega y organiza tus ingredientes</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Recent Recipes & Upcoming Meals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Recipes */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Recetas Recientes</h2>
                            <Link to="/recipes" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                                Ver todas
                            </Link>
                        </div>

                        {recentRecipes.length > 0 ? (
                            <div className="space-y-3">
                                {recentRecipes.map((recipe) => (
                                    <Link
                                        key={recipe.id}
                                        to={`/recipes/${recipe.id}`}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                            <ChefHat className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 truncate">{recipe.name}</h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {recipe.cook_time} min
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">Aún no hay recetas. ¡Genera la primera!</p>
                        )}
                    </div>

                    {/* Upcoming Meals */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Próximas Comidas</h2>
                            <Link to="/meal-plan" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                                Ver calendario
                            </Link>
                        </div>

                        {upcomingMeals.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingMeals.map((meal) => (
                                    <div
                                        key={meal.id}
                                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-100"
                                    >
                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 truncate">{meal.recipe_name}</h3>
                                            <p className="text-sm text-gray-500 capitalize">{meal.meal_type}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No hay comidas planificadas todavía</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => {
    const colorClasses = {
        emerald: 'bg-emerald-100 text-emerald-600',
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600'
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;