const mongoose = require('mongoose')
require('dotenv').config()

const ProductSchema = new mongoose.Schema({
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
    }
})

const Product = mongoose.model("Product", ProductSchema)

module.exports = Product