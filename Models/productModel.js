const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
Name: String,
Price: Number,
Quantity: Number,
isAvailable: Boolean
});

const productModel = new mongoose.model("Products", productSchema);

module.exports = productModel;