const express = require('express');
const cors = require('cors')
require("dotenv").config();
require('./db/mongoose');


const emails = require('./emails/password_reset');
const User = require('./models/user');
const Organization = require('./models/organization');
const FoodRequest = require('./models/foodRequest');

const userRouter = require('./routers/user');
const organizationRouter = require('./routers/organization');
const foodRequestRouter = require('./routers/foodRequest');

const app = express()
const port = process.env.PORT||3001

app.use(express.json());
//It automatically parse incoming JSON to an object so that we can access it 
app.use(cors())
app.use(userRouter);
app.use(organizationRouter);
app.use(foodRequestRouter);

app.listen(port,() =>{ 
  console.log("Server is up on port",port);  
});



