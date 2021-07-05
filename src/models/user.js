const mongoose= require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const FoodRequests = require('./foodRequest');
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim: true
    },
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
    password:{
        type:String,
        required: true,
        trim:true
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
            trim: true,
            required:true
        }
    }],
    tokens:[{// an array to store all the login tokens of the user
        token:{
            type:String,
            required:true
        }
    }], 
    image:Buffer
},{timestamps:true});

userSchema.virtual('foodRequests',{
    ref:'FoodRequests',
    localField:'_id',
    foreignField:'owner'
})

//Generating jwt authentication tokens
userSchema.methods.generateAuthToken = async function (){
    const user = this;
    const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET_TOKEN_PASSWORD);

    //Saving tokens in user so as he can login over multiple devices and we can keep a track of that.
    user.tokens = user.tokens.concat({token});
    await user.save()
    return token;
}

//Find the user with a given login id and password
userSchema.statics.findByCredentials = async (email, password)=> {
    const user = await User.findOne({
        email
    });
    if(!user){
        throw new Error('Unable to login');
    }

    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        throw new Error('Unable to login');
    }
    return user

}
userSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
}



//Called just before saving. Used to hash the password
userSchema.pre('save',async function (next){
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8);
    }
    
    next(); 

});

//Delete user requests when user is removed
userSchema.pre('remove',async function(next){
    const user = this;
    await FoodRequests.deleteMany({owner:user._id });
    next();
})

const User = mongoose.model('User',userSchema);
module.exports = User;
