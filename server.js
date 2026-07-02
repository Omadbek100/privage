const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Company = require("./models/Company");
const Verification = require("./models/Verification");
const User = require("./models/User");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());


// MongoDB
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("🗄️ MongoDB connected"))
.catch(err => console.log("MongoDB error:", err));



// HOME
app.get("/", (req,res)=>{
    res.json({
        project:"PrivAge",
        version:"1.3.0",
        status:"running"
    });
});


// TEST
app.get("/test",(req,res)=>{
    res.json({
        message:"PrivAge test ishladi"
    });
});



// CREATE COMPANY
app.post("/companies", async(req,res)=>{

    const {name,email}=req.body;


    if(!name || !email){
        return res.status(400).json({
            success:false,
            message:"name and email required"
        });
    }


    const apiKey =
        "priv_live_" + Math.random().toString(36).substring(2,15);


    const company = await Company.create({
        name,
        email,
        apiKey
    });


    res.json({
        success:true,
        company
    });

});



// REGISTER
app.post("/register", async (req,res)=>{

try {

    const { name, email, password, companyName } = req.body;


    if(!name || !email || !password || !companyName){
        return res.status(400).json({
            success:false,
            message:"All fields required"
        });
    }


    const hashPassword = await bcrypt.hash(password,10);


    const newApiKey =
        "priv_live_" + Math.random().toString(36).substring(2,15);



    const company = await Company.create({
        name: companyName,
        email: email,
        apiKey: newApiKey
    });



    const user = await User.create({
        name,
        email,
        password: hashPassword,
        company: company._id
    });



    const token = jwt.sign(
        {
            userId:user._id
        },
        process.env.JWT_SECRET
    );


    res.json({
        success:true,
        token,
        apiKey:newApiKey
    });


}catch(error){

    console.log("REGISTER ERROR:", error);

    res.status(500).json({
        success:false,
        error:error.message
    });

}

});



// LOGIN
app.post("/login", async(req,res)=>{

try{

    const {
        email,
        password
    } = req.body;



    const user =
        await User.findOne({email});



    if(!user){

        return res.status(404).json({
            message:"User not found"
        });

    }



    const ok =
        await bcrypt.compare(
            password,
            user.password
        );



    if(!ok){

        return res.status(401).json({
            message:"Wrong password"
        });

    }



    const token = jwt.sign(
        {
            userId:user._id
        },
        process.env.JWT_SECRET
    );



    res.json({
        success:true,
        token
    });



}catch(e){

    res.status(500).json({
        error:e.message
    });

}

});




// VERIFY AGE
app.post("/verify-age", async(req,res)=>{


const {
    apiKey,
    minimumAge,
    userAge
}=req.body;



const company =
    await Company.findOne({apiKey});



if(!company){

    return res.status(403).json({
        success:false,
        message:"Invalid API key"
    });

}



const allowed =
    userAge >= minimumAge;



await Verification.create({

    company:company._id,
    minimumAge,
    userAge,
    allowed

});



res.json({

    success:true,
    company:company.name,
    allowed,
    verified:true

});


});




// HISTORY
app.get("/verifications", async(req,res)=>{


const {apiKey}=req.query;


const company =
    await Company.findOne({apiKey});



if(!company){

    return res.status(403).json({
        message:"Invalid API key"
    });

}



const data =
await Verification.find({
    company:company._id
})
.sort({
    createdAt:-1
});



res.json({

    success:true,
    total:data.length,
    verifications:data

});


});




// STATS
app.get("/stats", async(req,res)=>{


const {apiKey}=req.query;


const company =
await Company.findOne({apiKey});



if(!company){

return res.status(403).json({
    message:"Invalid API key"
});

}



const total =
await Verification.countDocuments({
company:company._id
});


const allowed =
await Verification.countDocuments({
company:company._id,
allowed:true
});


const rejected =
await Verification.countDocuments({
company:company._id,
allowed:false
});



res.json({

success:true,

statistics:{
    total,
    allowed,
    rejected
}

});


});





app.listen(3000,()=>{

console.log("🚀 PrivAge API running on port 3000");

});