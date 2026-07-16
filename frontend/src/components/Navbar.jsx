import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChefHat, Home, UtensilsCrossed, Calendar, ShoppingCart, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRef } from 'react';



const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen,setIsDropdownOpen]=useState(false);
    const dropdownRef= useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsDropdownOpen(false);
    };


    useEffect(()=>{
        const handleClickOutside=(event)=>{
            if(dropdownRef.current && !dropdownRef.current.contains(event.target)){
                       setIsDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown",handleClickOutside);
        return ()=> document.removeEventListener("mousedown",handleClickOutside);

    },[])

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                        <ChefHat className="w-7 h-7 text-emerald-500" />
                        <span>Generador de Recetas IA</span>
                    </Link>

                    {/* Enlaces de Navegación */}
                    <div className="hidden md:flex items-center gap-1">
                        <NavLink to="/dashboard" icon={<Home className="w-4 h-4" />} label="Inicio" />
                        <NavLink to="/pantry" icon={<UtensilsCrossed className="w-4 h-4" />} label="Despensa" />
                        <NavLink to="/generate" icon={<ChefHat className="w-4 h-4" />} label="Generar" />
                        <NavLink to="/recipes" icon={<UtensilsCrossed className="w-4 h-4" />} label="Recetas" />
                        <NavLink to="/meal-plan" icon={<Calendar className="w-4 h-4" />} label="Plan de Comidas" />
                        <NavLink to="/shopping-list" icon={<ShoppingCart className="w-4 h-4" />} label="Compras" />
                    </div>

                    {/* Menú de Usuario */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/settings"
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                        </Link>
    <div className="relative" ref={dropdownRef}>
  <button 
    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none"
  >
    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
      {user?.name?.charAt(0).toUpperCase() || "U"}
    </div>
    <span className="text-sm font-medium text-gray-700"> {user?.name || "Usuario"} </span>
    <svg 
      className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {isDropdownOpen && (
    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
      {/* Sección del usuario con el avatar azul al lado */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-gray-700">
             {user?.name || "Usuario"}
          </span>
          <span className="text-xs text-gray-400  break-all">{user?.email || "usuario@correo.com"}</span>
      
        </div>
      </div>
      
      <button
        onClick={() => {
          logout();
          setIsDropdownOpen(false);
        }}
        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
      >
        Cerrar Sesión
      </button>
    </div>
  )}
</div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, icon, label }) => {
    return (
        <Link
            to={to}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
};

export default Navbar;