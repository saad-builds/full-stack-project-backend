const mongoose = require('mongoose');

const user = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    age: {
        type: Number,
        default: 18
    }
});

const userModel = mongoose.model("Users", user);

module.exports = userModel;
