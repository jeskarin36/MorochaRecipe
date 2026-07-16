import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    try {
        // req.header() de Express es insensible a mayúsculas, así que esto está bien
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No authentication token"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Asegúrate de que 'id' o '_id' coincida con cómo firmaste el JWT en el controlador
        req.user = {
            id: decoded.id || decoded._id, 
            email: decoded.email
        };

        next();

    } catch (error) {
        console.error("auth middleware error:", error.message);
        
        // Corregido res.status(401).json() para evitar que se caiga el servidor
        return res.status(401).json({
            success: false,
            message: "Token is not valid"
        });
    }
}

export default authMiddleware;