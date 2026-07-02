const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Company = require("./models/Company");
const Verification = require("./models/Verification");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());


// MongoDB
mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log("🗄️ MongoDB connected");
})
.catch((error) => {
    console.log("MongoDB error:", error);
});


// HOME
app.get("/", (req, res) => {
    res.json({
        project: "PrivAge",
        version: "1.2.0",
        status: "running"
    });
});


// TEST
app.get("/test", (req, res) => {
    res.json({
        message: "PrivAge test ishladi"
    });
});


// CREATE COMPANY
app.post("/companies", async (req, res) => {

    const { name, email } = req.body;

    if (!name || !email) {
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


// VERIFY AGE
app.post("/verify-age", async (req,res)=>{

    const {apiKey, minimumAge, userAge}=req.body;


    const company = await Company.findOne({apiKey});


    if(!company){
        return res.status(403).json({
            success:false,
            message:"Invalid API key"
        });
    }


    const allowed = userAge >= minimumAge;


    await Verification.create({
        company: company._id,
        minimumAge,
        userAge,
        allowed
    });


    res.json({
        success:true,
        company:company.name,
        verified:true,
        allowed,
        requiredAge:minimumAge
    });

});



// HISTORY
app.get("/verifications", async(req,res)=>{

    const {apiKey}=req.query;


    const company = await Company.findOne({apiKey});


    if(!company){
        return res.status(403).json({
            success:false,
            message:"Invalid API key"
        });
    }


    const verifications =
        await Verification.find({
            company:company._id
        })
        .sort({createdAt:-1});


    res.json({
        success:true,
        total:verifications.length,
        verifications
    });

});



// STATS
app.get("/stats", async(req,res)=>{

    const {apiKey}=req.query;


    const company = await Company.findOne({apiKey});


    if(!company){
        return res.status(403).json({
            success:false,
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
        company:company.name,
        statistics:{
            total,
            allowed,
            rejected
        }
    });

});


// SERVER
app.listen(3000,()=>{
    console.log("🚀 PrivAge API running on port 3000");
});