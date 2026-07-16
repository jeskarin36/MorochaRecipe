import PantryItem from "../models/PantryItem.js";


export const getPantryItems= async (req,res,next)=>{
    try {
        const {category,is_running_low,search}= req.query;

        const items = await PantryItem.findByUserId(req.user.id,{
            category,is_running_low:is_running_low==="true"? true :undefined, search
        });

        res.json({
            success:true,
            data:{items}
        });


    } catch (error) {
        next(error);
    }
}






export const getPantryStats= async (req,res,next)=>{
    try {
       
        const stats = await PantryItem.getStatus(req.user.id)

        res.json({
            success:true,
            data:{stats}
        });


    } catch (error) {
        next(error);
    }
}





export const getExpiringSoon = async (req, res, next) => {
    try {
        // Enfoque corregido buscando la propiedad .days del objeto query
        const days = parseInt(req.query.days) || 7;

        const items = await PantryItem.getExpiringSoon(req.user.id, days);

        res.json({
            success: true,
            data: { items }
        });

    } catch (error) {
        next(error);
    }
}




export const addPantryItem= async (req,res,next)=>{
    try {
        

        const items = await PantryItem.create(req.user.id,req.body);
        

        res.status(201).json({
            success:true,
            message:"Item added to Pantry",
            data:{items}
        });


    } catch (error) {
        next(error);
    }
}



export const updatePantryItem= async (req,res,next)=>{
    try {
        
        const {id}= req.params;
        const items = await PantryItem.update(id,req.user.id,req.body);
        

        if(!items){
            return res.status(404).json({
                success:false,
                message:"Pantry item not found"
            })
        }

        res.json({
            success:true,
            message:" Pantry item updated",
            data:{items}
        });


    } catch (error) {
        next(error);
    }
}



export const deletePantryItem= async (req,res,next)=>{
    try {
        
        const {id}= req.params;
        const items = await PantryItem.delete(id,req.user.id);
        

        if(!items){
            return res.status(404).json({
                success:false,
                message:"Pantry item not found"
            })
        }

        res.json({
            success:true,
            message:" Pantry item delete",
            data:{items}
        });


    } catch (error) {
        next(error);
    }
}