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
    if(Skip<0){
        console.log("Org")
    }

    const city = queries.city?queries.city:req.user.address[0].city;
    const state = queries.state?queries.state:req.user.address[0].state
    const country = queries.country?queries.country:req.user.address[0].country
    
    const filters = {city,state,country}
    let specialFilters = {country}
    if(postalCode){
        specialFilters['postalCode'] = postalCode
    }
    if(queries.city){
        specialFilters['city'] = city
    }
    let organization, Count;
    try{
        if(postalCode||queries.city){
            organization = await Organization.find({address:{$elemMatch:specialFilters}}).skip(Skip).limit(Limit);
            Count = await Organization.find({address:{$elemMatch:specialFilters}}).countDocuments();
        }else{
            organization = await Organization.find({address:{$elemMatch:filters}}).skip(Skip).limit(Limit);
            Count = await Organization.find({address:{$elemMatch:filters}}).countDocuments();
        }
        res.send({organization, count:Count, Limit, Skip});
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