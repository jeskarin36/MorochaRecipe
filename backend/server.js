import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";

import pantryRoutes from "./routes/pantry.js";
import recipeRoutes from "./routes/recipes.js";
import mealPlanRoutes from "./routes/mealPlans.js";
import shoopingListRoutes from "./routes/shoopingList.js";



const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get("/",(req,res)=>{
    res.json({message:"Ia generator"});
})


app.use("/api/auth",authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/pantry", pantryRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/meal-plans", mealPlanRoutes);
app.use("/api/shooping-list", shoopingListRoutes);

const PORT = process.env.PORT;

app.listen(PORT,()=>{
    console.log("serviir runner")
})