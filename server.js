const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(cors());
app.use(express.json());


// Demo API keys
const apiKeys = [
    process.env.API_KEY
];


// Health check
app.get("/", (req, res) => {
    res.json({
        project: "PrivAge",
        version: "1.1.0",
        status: "running"
    });
});


// Test
app.get("/test", (req, res) => {
    res.json({
        message: "PrivAge test ishladi"
    });
});


// Age verification
app.post("/verify-age", (req, res) => {

    const { apiKey, minimumAge, userAge } = req.body;


    // API key tekshirish
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: "API key required"
        });
    }


    if (!apiKeys.includes(apiKey)) {
        return res.status(403).json({
            success: false,
            message: "Invalid API key"
        });
    }


    // Yosh ma'lumotlarini tekshirish
    if (minimumAge === undefined || userAge === undefined) {
        return res.status(400).json({
            success: false,
            message: "minimumAge and userAge are required"
        });
    }


    const allowed = userAge >= minimumAge;


    res.json({
        success: true,
        verified: true,
        allowed,
        requiredAge: minimumAge
    });

});


// Server
app.listen(3000, () => {
    console.log("🚀 PrivAge API running on port 3000");
});