const mongoose = require('mongoose')
require('dotenv').config()

const CartSchema = new mongoose.Schema({
    id: Number,
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    imageLink: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    descriptions: {
        type: [String],
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true
    }
})

const Cart = mongoose.model("Cart", CartSchema)
module.exports = Cart