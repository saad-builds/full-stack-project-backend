const mongoose = require('mongoose');

const user = new mongoose.Schema({
    username: String,
    email: String,
    password: String,   
});

const userModel = mongoose.model("Users", user);

module.exports = userModel;
