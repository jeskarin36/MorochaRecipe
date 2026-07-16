import dotenv from "dotenv";
import path from "path";
import express from "express";
import cors from "cors";

// Tus rutas existentes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import pantryRoutes from "./routes/pantry.js";
import recipeRoutes from "./routes/recipes.js";
import mealPlanRoutes from "./routes/mealPlans.js";
import shoopingListRoutes from "./routes/shoopingList.js";

dotenv.config();

const app = express();
const __dirname = path.resolve();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de API
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/pantry", pantryRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/meal-plans", mealPlanRoutes);
app.use("/api/shooping-list", shoopingListRoutes);


if (process.env.NODE_ENV === "production") {
 
app.use(express.static(path.join(__dirname, "frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.json({ message: "Ia generator" });
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});