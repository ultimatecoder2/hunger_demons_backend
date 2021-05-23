const express = require('express');
const FoodRequest = require('../models/foodRequest');
const auth = require('../middleware/auth');
const router= new express.Router()

// Create a new food request
router.post('/foodrequests', auth, async(req,res)=>{
    const foodRequest = new FoodRequest({
        ...req.body, owner:req.user._id
    })
    try{
        await foodRequest.save();
        res.status(201).send(foodRequest);
    }
    
    catch(e){
        res.status(400).send(e);
    }
});

// get all food requests created by a user
router.get('/foodrequests/me', auth, async(req,res)=>{
    const queries = req.query;
    let {Limit, requestType, Skip, postalCode,owner} = queries;
    Limit = parseInt(Limit);
    Skip = parseInt(Skip);
    if(Skip<0){
        console.log(requestType);
    }
    const city = queries.city?queries.city:req.user.address[0].city
    const state = queries.state?queries.state:req.user.address[0].state
    const country = queries.country?queries.country:req.user.address[0].country 
    let filters = {city,state,country}
    let specialFilters = {country}
    if(postalCode){
        specialFilters['postalCode'] = postalCode
    }
    if(queries.city){
        specialFilters['city'] = city
    }
    try{
        let foodRequest, Count = 0;
        if(postalCode||queries.city){
            foodRequest = await FoodRequest.find({owner,requestType, address:{$elemMatch:specialFilters}}).sort({"updatedAt":-1}).skip(Skip).limit(Limit);
            Count = await FoodRequest.find({owner, requestType, address:{$elemMatch:specialFilters}}).countDocuments();
        }else{
            foodRequest = await FoodRequest.find({owner, requestType}).sort({"updatedAt":-1}).skip(Skip).limit(Limit);
            Count = await FoodRequest.find({owner, requestType}).countDocuments();
        }
        // console.log(foodRequest);
        res.send({foodRequest, count:Count, Limit, Skip});
    }
    catch(e){
        console.log(e);
        res.status(500).send(e);
    };
    
    
    // try{
    //      const foodRequest = await FoodRequest.find({owner})
    //       res.send(foodRequest);
    // }
    // catch(e){
    //     res.status(500).send(e);
    // }; 
});


// router.get('/foodrequests/me', auth, async(req,res)=>{
//     const queries = req.query;
//     let {Limit, requestType, Skip, postalCode} = queries;
//     Limit = parseInt(Limit);
//     Skip = parseInt(Skip);
//     if(Skip<0){
//         console.log(requestType);
//     }
//     const city = queries.city?queries.city:req.user.address[0].city
//     const state = queries.state?queries.state:req.user.address[0].state
//     const country = queries.country?queries.country:req.user.address[0].country 
//     filters = {city,state,country}
//     let specialFilters = {country}
//     if(postalCode){
//         specialFilters['postalCode'] = postalCode
//     }
//     if(queries.city){
//         specialFilters['city'] = city
//     }
//     try{
//         let foodRequest, Count = 0;
//         if(postalCode||queries.city){
//             foodRequest = await FoodRequest.find({requestType, address:{$elemMatch:specialFilters}}).sort({"updatedAt":-1}).skip(Skip).limit(Limit);
//             Count = await FoodRequest.find({requestType, address:{$elemMatch:specialFilters}}).countDocuments();
//         }else{
//             foodRequest = await FoodRequest.find({requestType, address:{$elemMatch:filters}}).sort({"updatedAt":-1}).skip(Skip).limit(Limit);
//             Count = await FoodRequest.find({requestType, address:{$elemMatch:filters}}).countDocuments();
        
//         }
//         // console.log(foodRequest);
//         res.send({foodRequest, count:Count, Limit, Skip});
//     }
//     catch(e){
//         console.log(e);
//         res.status(500).send(e);
//     }; 
// });




//Find a single food request 
router.get('/foodrequest/:id', async(req,res)=>{
    const _id = req.params.id;
    try{
        const foodRequest = await FoodRequest.findOne({_id});
        if(!foodRequest){

            return res.status(404).send();
        }
        res.send(foodRequest)
    }
    catch(e){
        res.status(500).send();
    }
});

//get food requests at a paticular location-- using query in url
router.get('/foodrequests', auth, async(req,res)=>{
    // console.log(req.query);
    const queries = req.query;
    let {Limit, requestType, Skip, postalCode} = queries;
    Limit = parseInt(Limit);
    Skip = parseInt(Skip);
    if(Skip<0){
        console.log(requestType);
    }
    const city = queries.city?queries.city:req.user.address[0].city
    const state = queries.state?queries.state:req.user.address[0].state
    const country = queries.country?queries.country:req.user.address[0].country 
    let filters = {city,state,country}
    let specialFilters = {country}
    if(postalCode){
        specialFilters['postalCode'] = postalCode
    }
    if(queries.city){
        specialFilters['city'] = city
    }
    try{
        let foodRequest, Count = 0;
        if(postalCode||queries.city){
            foodRequest = await FoodRequest.find({requestType, address:{$elemMatch:specialFilters}}).sort({"updatedAt":-1}).skip(Skip).limit(Limit);
            Count = await FoodRequest.find({requestType, address:{$elemMatch:specialFilters}}).countDocuments();
        }else{
            foodRequest = await FoodRequest.find({requestType, address:{$elemMatch:filters}}).sort({"updatedAt":-1}).skip(Skip).limit(Limit);
            Count = await FoodRequest.find({requestType, address:{$elemMatch:filters}}).countDocuments();
        
        }
        // console.log(foodRequest);
        res.send({foodRequest, count:Count, Limit, Skip});
    }
    catch(e){
        console.log(e);
        res.status(500).send(e);
    }; 
});





//Update a request
router.patch('/foodrequests/me/:id', auth, async(req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['foodType','food','quantity','address'];
    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update);
    });
    if(!isValidOperation){
        return res.status(400).send({error:"Invalid updates!"})
    }

    try{
        const foodRequest = await FoodRequest.findOne({_id: req.params.id,owner: req.user._id});
        if(!foodRequest){
            return res.status(404).send()
        } 
        updates.forEach((update) => foodRequest[update]= req.body[update] );
        await foodRequest.save();
        if(!foodRequest){
            return res.status(404).send();
        }
        res.send(foodRequest);
    }
    catch(e){
        res.status(400).send(e);
    }
});

//Delete a request
router.delete('/foodrequests/me/:id', auth, async(req,res) =>{
    try{
        const foodRequest = await FoodRequest.findOneAndDelete({_id: req.params.id, owner: req.user._id});
        if(!foodRequest){
            return res.status(404).send()
        }
        res.send(foodRequest);
    }
    catch(e){
        res.status(500).send()
    }
});
module.exports = router;