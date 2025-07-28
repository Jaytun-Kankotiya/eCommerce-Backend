const mongoose = require('mongoose')

const AddressSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: String,
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    addressLine1: {
        type: String,
        required: true
    },
    addressLine2: String,
    postalcode: { 
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    province: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    default: Boolean,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

const Address = mongoose.model("Address", AddressSchema)
module.exports = Address