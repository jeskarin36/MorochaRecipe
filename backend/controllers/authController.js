import User from "../models/User.js";
import UserPreference from "../models/UserPreferences.js"; // 🚀 Corregido a singular y con .js
import jwt from "jsonwebtoken";

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );
};

export const register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: "Please provide email, password and name"
            });
        }

        const existingUser = await User.findByEmail(email);

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        const user = await User.create({ email, password, name });

        // Insertar preferencias iniciales por defecto en la base de datos
        await UserPreference.upsert(user.id, {
            dietary_restrictions: [],
            allergies: [],
            preferred_cuisines: [],
            default_services: 4, // Recuerda que en tu SQL se llama default_services
            measurement_unit: "metric"
        });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: "User registered successfully", // Corregido typo
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                },
                token
            }
        });

    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            });
        }

        const isPasswordValid = await User.verifyPassword(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            });
        }

        const token = generateToken(user);

        // 🚀 Corregido: success ahora es true
        res.json({
            success: true, 
            message: "Login Successful",
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                },
                token
            }
        });

    } catch (error) {
        next(error);
    }
};

// 🚀 Corregido: Nombre unificado a getCurrentUser para que coincida con tus rutas
export const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 🛡️ Seguridad: Ocultar el hash antes de enviar la información
        if (user.password_hash) {
            delete user.password_hash;
        }

        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const requestPasswordReset = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please provide email"
            });
        }

        // Simplemente validamos si el flujo corre sin errores
        await User.findByEmail(email);

        res.json({
            success: true,
            message: "If an account exists with this email, a password reset link has been sent"
        });

    } catch (error) {
        next(error);
    }
};