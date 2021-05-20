const express = require('express');
const User = require('../models/user');
const router= new express.Router()
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const upload = multer()

//Signup
router.post('/users',async(req,res)=>{
    const user = new User(req.body);
    try{
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user,token}) 
    }
    catch(e){
        res.status(400).send(e);
    };
});

//Login
router.post('/users/login',async(req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password);
        const token = await user.generateAuthToken()//Generate jwt authentication token
        res.send({user,token})
    }
    catch(e){
        res.status(400).send('Details Mismatched')                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
    }
})

//Logout
router.post('/users/logout',auth, async(req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token!== req.token
        })
        await req.user.save()
        res.send()
    }
    catch(e){
        console.log("Logout error",e);
        res.status(500).send(e)
    }
});

//Logout all sessions
router.post('/users/logoutAll',auth, async(req,res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }
    catch(e){
        console.log(e);
        res.status(500).send()
    }

});


//get user details
router.get('/users/me', auth, async(req,res)=>{
    res.send(req.user); 
});

router.get('/users/:id', async(req,res)=>{
    try{
        const id = req.params.id;
        const user = await User.findById(id);
        if(!user)
            throw new Error();
        
        res.send(user);
    }catch(e){

        res.status(404).send();
    }
     
});

//get user Image
router.get('/users/:id/image',async(req, res)=>{
    try{
        const user = await User.findById(req.params.id);
        if(!user||!user.image)
            throw new Error();
        res.set('Content-Type','images/png')
        res.send(user.image);

    } catch(e){
        res.status(404).send();
    }
})

//Update user details
router.patch('/users/me', auth, upload.single('image'), async(req, res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','email','password','contact'];
    let isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update);
    });
    if(updates.includes('image')){
        isValidOperation = true;
    }
    if(!isValidOperation){
        return res.status(400).send({error:"Invalid updates!"})
    }
    try{
        const user = req.user;
        const data = req.body;
        let image = req.file;
        updates.forEach((Update)=>{
            if(Update==='image'){
                return;
            }
            if(data[Update]){
                user[Update] = data[Update]
            }
        })
        //update all fields
        updates.forEach((update) => user[update]= req.body[update] ); 
        if(image){
            const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer();
            user.image = buffer;
        }    
        await user.save();
        res.send({message:"Your details have been updated successfully"});
    }
    catch(e){
        res.status(500).send(e);
    }
});

router.patch('/users/me/address', auth, async(req,res)=>{
    let address = req.body;
    const updates = Object.keys({...address});
    const allowedUpdates = ['addressLine1','addressLine2', 'city','state', 'postalCode', 'country'];
    const isValidOperation = updates.every((update)=>{
        return(allowedUpdates.includes(update))
    });
    if(!isValidOperation){
        return res.status(400).send({error:"Invalid updates!"})
    }
    try{
        const user = req.user;
        updates.forEach((update) => user.address[0][update]= address[update] );
        await user.save();
        res.send({message:"Your details have been upated successfully"});
    }
    catch(e){
        res.status(400).send(e);
    }
});


//Delete a user's account
router.delete('/users/me', auth, async (req,res) =>{
    try {
        
        await req.user.remove();
        res.send(req.user);
    }
    catch(e){
        res.status(500).send()
    }
});

module.exports = router;

    // OTHERS
    // Get user of a specific id
// router.get('/users/:id', async(req,res)=>{
//     const _id = req.params._id;
//     try{
//         const user = await User.findById(_id);
//         if(!user){
//             return res.status(404).send();
//         }
//         res.send(user)
//     }
//     catch(e){
//         res.status(500).send();
//     }
// });

        //Delete a user with specific id
    // router.delete('/users/id', auth, async (req,res) =>{
    //     try {
    //         const user = await User.findByIdAndDelete(req.params.id) 
    //         if(!user){
    //             return res.status(404).send();
    //         }
    
    //         res.send(user);
    //     }
    //     catch(e){
    //         res.status(500).send()
    //     }
    // });