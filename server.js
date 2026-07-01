const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.json({
        project: "PrivAge",
        version: "1.0.0",
        status: "running"
    });
});

// Age verification
app.post("/verify-age", (req, res) => {

    const { minimumAge, userAge } = req.body;

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
app.get("/test", (req, res) => {
    res.json({
        message: "PrivAge test ishladi"
    });
});
app.listen(3000, () => {
    console.log("🚀 PrivAge API running on port 3000");
});