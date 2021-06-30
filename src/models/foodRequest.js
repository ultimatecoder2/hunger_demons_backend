const mongoose= require('mongoose');
const validator = require('validator');

const foodSchema = new mongoose.Schema({
    requestType:{ // either one from needy/ donor
        type:String,
        required:true,
        trim:true
    },
    foodType:[{
        //One from freshly cooked or packed food or raw food
        type: String,
        trim:true,
        required:true
    }],
    food_description:[{
        foodName:{
            type: String,
            trim:true,
            required:true
        },
        quantity:{
            type: Number,
            trim:true,
            required:true
        }
        //It contains specific food like wheat, rice, etc...
        
    }],
    address:[{
        addressLine1:{
            type:String,
            trim: true
        },
        addressLine2:{
            type:String,
            trim: true
        },
        city:{
            type:Object,
            trim: true
        },
        state:{
            type:String,
            trim: true
        },
        postalCode:{
            type:String,
            trim: true
        },
        country:{
            type:String,
            trim: true,
            required:true
        }
    }],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
},{timestamps:true});

const FoodRequest = mongoose.model('FoodRequest',foodSchema);
module.exports = FoodRequest;