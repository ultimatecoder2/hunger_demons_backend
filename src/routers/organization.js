const express = require('express');
const Organization = require('../models/organization');
const auth = require('../middleware/auth');
const router= new express.Router()

// Create a new Organization
router.post('/organization', async(req,res)=>{
    const organization = new Organization({
        ...req.body
    })
    try{
        await organization.save();
        res.status(201).send(organization);
    }
    catch(e){
        res.status(400).send(e);
    }
});

// get all the organizations
//Sample url: /organization?city=""&state=""
router.get('/organization',auth, async(req,res)=>{
    const queries = req.query;
    let {Limit, Skip, postalCode} = queries;
    Limit = parseInt(Limit);
    Skip = parseInt(Skip);
    const city = queries.city?JSON.parse(queries.city):req.user.address[0].city

    let organization, Count;
    try{
        
            organization = await Organization.find({address:{$elemMatch:{city}}}).skip(Skip).limit(Limit);
            // Count = await Organization.find({address:{$elemMatch:filters}}).countDocuments();
        
        res.send({organization, Limit, Skip});
    }
    catch(e){
        console.log(e)
        res.status(500).send(e);
    }; 
});

// get all organizations in the user's country
router.get('/organization/all', async(req,res)=>{
    const country = req.user.address[0].country;
    try{
        const organization = await Organization.find({address:{$elemMatch:{country}}});
        if(!organization){
            return res.status(404).send();
        }
        res.send(organization)
    }
    catch(e){
        
        res.status(500).send();
    }
});


module.exports = router;