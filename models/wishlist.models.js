const mongoose = require("mongoose")

const WishlistSchema = new mongoose.Schema({
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
        ref: 'User',
        required: true
    }
})

const Wishlist = mongoose.model("Wishlist", WishlistSchema)
module.exports = Wishlist