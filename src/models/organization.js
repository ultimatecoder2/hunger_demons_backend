const mongoose= require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Organization = require('./organization');
const organizationSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim: true
    },
    foodType:[{
        //One from freshly cooked or packed food or raw food
        type: String,
        trim:true,
        required:true
    }],
    email:{
        type:String,
        required: true,
        unique:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    contact:{
        type: String,
        trim: true,
    },
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
            trim: true
        }
    }]
    
},{timestamps:true});


const Organizations = mongoose.model('Organization',organizationSchema);
module.exports = Organizations;


