const mongoose = require("mongoose") 

const OrdersSchema = new mongoose.Schema({
    id: Number,
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
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
        paymentMethod: String,
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
        userId: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User",
            required: true
        }
},
{timestamps: true}
)

const Orders = mongoose.model("Orders", OrdersSchema)

module.exports = Orders