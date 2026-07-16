import { useState, useEffect } from 'react';
import { User, Lock, Trash2, Save } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { dummyUser, dummyPreferences } from '../data/dummyData';
import api from "../services/api.js";

// Traducido al español
const DIETARY_OPTIONS = ['Vegetariano', 'Vegano', 'Sin Gluten', 'Sin Lácteos', 'Keto', 'Paleo'];
const CUISINES = ['Cualquiera', 'Italiana', 'Mexicana', 'India', 'China', 'Japonesa', 'Tailandesa', 'Francesa', 'Mediterránea', 'Americana'];

const Settings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // Estado del perfil
    const [profile, setProfile] = useState({
        name: '',
        email: ''
    });

    // Estado de preferencias
    const [preferences, setPreferences] = useState({
        dietary_restrictions: [],
        allergies: [],
        preferred_cuisines: [],
        default_servings: 4,
        measurement_unit: 'metric'
    });

    // Estado de la contraseña
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await api.get("/user/profile");
            const { user, preferences: userPrefs } = response.data.data;

            setProfile({
                name: user.name,
                email: user.email
            });

            if (userPrefs) {
                setPreferences({
                    dietary_restrictions: userPrefs.dietary_restrictions || [],
                    allergies: userPrefs.allergies || [],
                    preferred_cuisines: userPrefs.preferred_cuisines || [],
                    default_servings: userPrefs.default_servings || 4,
                    measurement_unit: userPrefs.measurement_unit || 'metric'
                });
            }
        } catch (error) {
            toast.error("Error al cargar los datos del usuario");
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put("/user/profile", profile);
            toast.success("Perfil actualizado con éxito");

            const updatedUser = { ...user, ...profile };
            localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (error) {
            toast.error("Error al actualizar el perfil");
        } finally {
            setSaving(false);
        }
    };

    const handlePreferencesUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put("/user/preferences", preferences);
            toast.success("Preferencias actualizadas con éxito");
        } catch (error) {
            toast.error("Error al actualizar las preferencias");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setSaving(true);

        try {
            await api.put("/user/change-password", {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success("Contraseña cambiada con éxito");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al cambiar la contraseña");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
            return;
        }

        const confirmation = prompt('Escribe "ELIMINAR" para confirmar la eliminación de la cuenta:');
        if (confirmation !== 'ELIMINAR') {
            toast.error('Eliminación de cuenta cancelada');
            return;
        }

        try {
            await api.delete("/user/account");
            toast.success("Cuenta eliminada con éxito");
            logout();
            navigate("/login");
        } catch (error) {
            toast.error("Error al eliminar la cuenta");
        }
    };

    const toggleDietary = (option) => {
        setPreferences(prev => ({
            ...prev,
            dietary_restrictions: prev.dietary_restrictions.includes(option)
                ? prev.dietary_restrictions.filter(d => d !== option)
                : [...prev.dietary_restrictions, option]
        }));
    };

    const toggleCuisine = (cuisine) => {
        setPreferences(prev => ({
            ...prev,
            preferred_cuisines: prev.preferred_cuisines.includes(cuisine)
                ? prev.preferred_cuisines.filter(c => c !== cuisine)
                : [...prev.preferred_cuisines, cuisine]
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500 text-lg">Cargando configuración...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
                    <p className="text-gray-600 mt-1">Gestiona tu cuenta y preferencias</p>
                </div>

                <div className="space-y-6">
                    {/* Profile Section */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <User className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Información del Perfil</h2>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 outline-none cursor-not-allowed"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Guardando...' : 'Guardar Perfil'}
                            </button>
                        </form>
                    </div>

                    {/* Change Password Section */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Lock className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Cambiar Contraseña</h2>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña Actual</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nueva Contraseña</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                <Lock className="w-4 h-4" />
                                {saving ? 'Cambiando...' : 'Cambiar Contraseña'}
                            </button>
                        </form>
                    </div>

                    {/* Preferences Section */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferencias Alimentarias</h2>

                        <form onSubmit={handlePreferencesUpdate} className="space-y-6">
                            {/* Dietary Restrictions */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Restricciones Alimentarias</label>
                                <div className="flex flex-wrap gap-2">
                                    {DIETARY_OPTIONS.map(option => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => toggleDietary(option)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${preferences.dietary_restrictions.includes(option)
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Allergies */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Alergias (separadas por comas)</label>
                                <input
                                    type="text"
                                    value={preferences.allergies.join(', ')}
                                    onChange={(e) => setPreferences({
                                        ...preferences,
                                        allergies: e.target.value.split(',').map(a => a.trim()).filter(Boolean)
                                    })}
                                    placeholder="ej. maní, mariscos, soya"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                />
                            </div>

                            {/* Preferred Cuisines */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Tipos de Cocina Preferidos</label>
                                <div className="flex flex-wrap gap-2">
                                    {CUISINES.map(cuisine => (
                                        <button
                                            key={cuisine}
                                            type="button"
                                            onClick={() => toggleCuisine(cuisine)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${preferences.preferred_cuisines.includes(cuisine)
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {cuisine}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Default Servings */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Porciones por Defecto: {preferences.default_servings}
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="12"
                                    value={preferences.default_servings}
                                    onChange={(e) => setPreferences({ ...preferences, default_servings: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>1</span>
                                    <span>12</span>
                                </div>
                            </div>

                            {/* Measurement Unit */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sistema de Medición</label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPreferences({ ...preferences, measurement_unit: 'metric' })}
                                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${preferences.measurement_unit === 'metric'
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        Métrico (kg, L)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreferences({ ...preferences, measurement_unit: 'imperial' })}
                                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${preferences.measurement_unit === 'imperial'
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        Imperial (lb, gal)
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Guardando...' : 'Guardar Preferencias'}
                            </button>
                        </form>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white rounded-xl border border-red-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Zona de Peligro</h2>
                        </div>

                        <p className="text-gray-600 mb-4">
                            Una vez que elimines tu cuenta, no habrá marcha atrás. Todas tus recetas, planes de comida y datos personales se borrarán de forma permanente.
                        </p>

                        <button
                            onClick={handleDeleteAccount}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Eliminar Cuenta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;