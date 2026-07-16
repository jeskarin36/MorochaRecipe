import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, X, Check, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from "../services/api.js";

// Categorías traducidas al español
const CATEGORIES = ['Verduras y Frutas', 'Lácteos', 'Carnes', 'Cereales', 'Especias', 'Bebidas', 'Otros'];

const ShoppingList = () => {
    const [items, setItems] = useState([]);
    const [groupedItems, setGroupedItems] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchShoppingList();
    }, []);

    const fetchShoppingList = async () => {
        try {
            setLoading(true);
            const response = await api.get("/shooping-list?group=true");
            const cleanItems = response.data?.data?.items || response.data?.items || response.data || [];
            
            setItems(cleanItems);
            organizeByCategory(cleanItems);
        } catch (error) {
            toast.error("Error al cargar la lista de compras");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const organizeByCategory = (itemsList) => {
        const grouped = {};
        itemsList.forEach(item => {
            // Mapeo por si la API devuelve 'Other' en lugar de 'Otros'
            let category = item.category || 'Otros';
            if (category === 'Other') category = 'Otros';
            
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(item);
        });
        setGroupedItems(grouped);
    };

    const handleToggleChecked = async (id) => {
        const previousItems = [...items];

        const updatedItems = items.map(item =>
            item.id === id ? { ...item, is_checked: !item.is_checked } : item
        );
        setItems(updatedItems);
        organizeByCategory(updatedItems);

        try {
            await api.put(`/shooping-list/${id}/toggle`);
        } catch (error) {
            toast.error("Error al actualizar el artículo");
            setItems(previousItems);
            organizeByCategory(previousItems);
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            await api.delete(`/shooping-list/${id}`);
            const updatedItems = items.filter(item => item.id !== id);
            setItems(updatedItems);
            organizeByCategory(updatedItems);
            toast.success("Artículo eliminado");
        } catch (error) {
            toast.error("Error al eliminar el artículo");
        }
    };

    const handleClearChecked = async () => {
        if (!confirm('¿Eliminar todos los artículos marcados?')) return;

        try {
            await api.delete(`/shooping-list/clear/checked`);
            const updatedItems = items.filter(item => !item.is_checked);
            setItems(updatedItems);
            organizeByCategory(updatedItems);
            toast.success("Artículos marcados eliminados");
        } catch (error) {
            toast.error("Error al limpiar los artículos");
        }
    };

    const handleAddToPantry = async () => {
        const checkedCount = items.filter(item => item.is_checked).length;
        if (checkedCount === 0) {
            toast.error('No hay artículos marcados');
            return;
        }

        if (!confirm(`¿Agregar ${checkedCount} artículos marcados a la despensa?`)) return;

        try {
            await api.post(`/shooping-list/add-to-pantry`);
            const updatedItems = items.filter(item => !item.is_checked);
            setItems(updatedItems);
            organizeByCategory(updatedItems);
            toast.success("Artículos agregados a la despensa");
        } catch (error) {
            toast.error("Error al agregar artículos a la despensa");
        }
    };

    const checkedCount = items.filter(item => item?.is_checked).length;
    const totalCount = items.length;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Encabezado */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Lista de Compras</h1>
                    <p className="text-gray-600 mt-1">
                        {totalCount > 0 ? `${checkedCount} de ${totalCount} artículos marcados` : 'Tu lista de compras está vacía'}
                    </p>
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Agregar Artículo
                    </button>
                    {checkedCount > 0 && (
                        <>
                            <button
                                onClick={handleAddToPantry}
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Llevar a la Despensa ({checkedCount})
                            </button>
                            <button
                                onClick={handleClearChecked}
                                className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg font-medium transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                                Limpiar Marcados
                            </button>
                        </>
                    )}
                </div>

                {/* Lista de Compras */}
                {loading ? (
                    <div className='flex items-center justify-center h-96'>
                        <div className='w-8 h-8 border-emerald-500 border-t-transparent rounded-full animate-spin'></div>
                    </div>
                ) : totalCount > 0 ? (
                    <div className="space-y-6">
                        {Object.entries(groupedItems).map(([category, categoryItems]) => (
                            categoryItems.length > 0 && (
                                <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                                        <h2 className="font-semibold text-gray-900">{category}</h2>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {categoryItems.map(item => (
                                            <ShoppingListItem
                                                key={item.id}
                                                item={item}
                                                onToggle={handleToggleChecked}
                                                onDelete={handleDeleteItem}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">Tu lista de compras está vacía</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Agregar tu primer artículo
                        </button>
                    </div>
                )}
            </div>

            {/* Modal para agregar artículo */}
            {showAddModal && (
                <AddItemModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={(newItem) => {
                        const updatedItems = [...items, newItem];
                        setItems(updatedItems);
                        organizeByCategory(updatedItems);
                        setShowAddModal(false);
                    }}
                />
            )}
        </div>
    );
};

const ShoppingListItem = ({ item, onToggle, onDelete }) => {
    return (
        <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group">
            <button onClick={() => onToggle(item.id)} className="shrink-0">
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${item.is_checked
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-gray-300 hover:border-emerald-500'
                    }`}>
                    {item.is_checked && <Check className="w-4 h-4 text-white" />}
                </div>
            </button>

            <div className="flex-1 min-w-0">
                <p className={`font-medium ${item.is_checked ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {item.ingredient_name}
                </p>
                <p className={`text-sm ${item.is_checked ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.quantity} {item.unit}
                    {item.from_meal_plan && (
                        <span className="ml-2 text-xs text-emerald-600">• Plan de comidas</span>
                    )}
                </p>
            </div>

            <button
                onClick={() => onDelete(item.id)}
                className="shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};

const AddItemModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        ingredient_name: '',
        quantity: '',
        unit: 'unidades',
        category: 'Otros'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post(`/shooping-list`, {
                ...formData,
                quantity: parseFloat(formData.quantity)
            });

            toast.success("Artículo agregado a la lista");
            
            const createdItem = response.data?.data || response.data || { ...formData, id: Date.now(), is_checked: false };
            onSuccess(createdItem);
            onClose();
        } catch (error) {
            toast.error("Error al agregar el artículo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Agregar Artículo</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Artículo</label>
                        <input
                            type="text"
                            value={formData.ingredient_name}
                            onChange={(e) => setFormData({ ...formData, ingredient_name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Unidad</label>
                            <select
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                            >
                                <option value="unidades">Unidades (pcs)</option>
                                <option value="kg">Kilogramos (kg)</option>
                                <option value="g">Gramos (g)</option>
                                <option value="l">Litros (L)</option>
                                <option value="ml">Mililitros (ml)</option>
                                <option value="tazas">Tazas</option>
                                <option value="cucharadas">Cucharadas (tbsp)</option>
                                <option value="cucharaditas">Cucharaditas (tsp)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Agregando...' : 'Agregar Artículo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShoppingList;