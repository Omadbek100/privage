const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: String,

    email: {
        type: String,
        unique: true
    },

    password: String,

    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company"
    },

    createdAt:{
        type:Date,
        default:Date.now
    }

});


module.exports = mongoose.model("User", userSchema);