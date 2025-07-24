const mongoose = require('mongoose')
const Wishlist = require('./wishlist.models')
const Cart = require('./cart.models')
require('dotenv').config()

const UserProfileSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    }, 
    password: {
        type: String,
        required: true
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Wishlist'
    }],
    cart: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Cart'
    }],
    addresses: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Address'
    }],
    orders: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Orders'
    }]
})

const User = mongoose.model("User", UserProfileSchema)

module.exports = User