const express = require('express')
require('dotenv').config();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET


const app = express()
app.use(express.json())

const cors = require("cors");
const { initializedata } = require('./db/db.connect');
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions))

const Product = require('./models/product.models')
const User = require('./models/userDetails.models');
const Wishlist = require('./models/wishlist.models');
const Cart = require('./models/cart.models');
const Address = require('./models/address.models');


initializedata()

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided.' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Invalid token format.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    req.userId = decoded.userId
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

app.post('/productListing', async (req, res) => {
    try {
        const newData = await Product.insertMany(productsData)
        res.status(200).json({message: "New Product data added successfully.", data: newData})
    } catch (error) {
        res.status(500).json({error: "Not found."})
    }
})


app.get('/productListing', async (req, res) => {
    try {
        const fetchedProducts = await Product.find()
        if(fetchedProducts){
            res.json(fetchedProducts)
        }else {
            res.status(404).json({error: "Failed to fetch the data."})
        }
    } catch (error) {
        res.status(500).json({error: "Not found."})
    }
})

app.get('/productListing/:category', async(req, res) => {
    try {
        const productByCategory = await Product.find({category: req.params.category})
        if(productByCategory){
            res.json(productByCategory)
        } else {
            res.status(404).json({error: "Failed to fetch the data by category"})
        }
    } catch (error) {
        res.status(500).json({error: "Not Found."})
    }
})

app.get('/productDetails/:id', async (req, res) => {
    try {
        const productDetails = await Product.findOne({id: req.params.id})
        if(productDetails){
            res.json(productDetails)
        }else {
            res.status(404).json({error: "Failed to fetch the data by id."})
        }
    } catch (error) {
        res.status(500).json({error: "Not found."})
    }
})


async function addNewUser(userData){
    try {
        const findUser = await User.findOne({email: userData.email})
        if(findUser){
            throw new Error("This is email is already exist, Please Login.")
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10)
        const addUserDetails = new User({...userData, password: hashedPassword})
        const savedUser = await addUserDetails.save()
        return savedUser
    } catch (error) {
        throw error
    }
}

app.get('/allUsers', authenticate, async (req, res) => {
    try {
        const user = await User.find()
        res.status(200).json({userData: user})
    } catch (error) {
        res.status(500).json({error: "Failed to fetch wishlist/cart."})
    }
})


app.get('/userProfile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('wishlist').populate('cart')
        res.status(200).json({
            userData: user,
            wishlist: user.wishlist,
            cart: user.cart
        })
    } catch (error) {
        res.status(500).json({error: "Failed to fetch wishlist/cart."})
    }
})

app.post('/userProfile', async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists.' });
    }
        const addUser = await addNewUser(req.body)
        const token = jwt.sign({ userId: addUser._id, email: addUser.email }, JWT_SECRET, { expiresIn: '2h' });
        res.status(200).json({message: "User added successfully.", user: {firstName: addUser.firstName, lastName: addUser.lastName, email: addUser.email}, token: token})
    } catch (error) {
        res.status(400).json({error: error.message || "Failed to add user."})
    }
})

async function fetchUserData(userData){
    try {
        const fetchUser = await User.findOne({email: userData.email})
         if (!fetchUser) {
            throw new Error("User not found.");
        }
        const isMatch = await bcrypt.compare(userData.password, fetchUser.password)
        if(!isMatch){
            throw new Error("Invalid Credentials.")
        }
        return fetchUser
    } catch (error) {
        throw error
    }
}


app.post('/userProfile/verify', async (req, res) => {
    try {
        const user = await fetchUserData(req.body)
        const token = jwt.sign({userId: user._id, email: user.email}, JWT_SECRET, {expiresIn: '2h' })
        res.status(200).json({message: "User Verified successfully.", user: {firstName: user.firstName, lastName: user.lastName, email: user.email }, token})
    } catch (error) {
        res.status(401).json({error: error.message || "Failed to verify user."})
    }
})


async function wishlistAdd(productData){
    try {
        const dataToAdd = new Wishlist(productData)
        const dataSave = await dataToAdd.save()
        return dataSave
    } catch (error) {
        console.log("Error adding data to wishlist.", error)
    }
}

app.post('/wishlist', authenticate, async (req, res) => {
    try {
        const saved = await wishlistAdd({...req.body, userId: req.userId})

        await User.findByIdAndUpdate(req.userId, {
            $push: {wishlist: saved._id}
        })
        res.status(200).json({message: "Product added to wishlist", data: saved})
    } catch (error) {
        console.error("Error in /wishlist:", error)
        res.status(500).json({error: "Not found."})
    }
})

app.delete("/wishlist/:id", authenticate, async (req, res) => {
    try {
        const productToDelete = await Wishlist.findOneAndDelete({id: req.params.id, userId: req.userId})
        if(!productToDelete){
            res.status(404).json({error: "Cart item not found or already deleted."})
        }

        await User.findByIdAndUpdate(req.userId, {
            $pull: {wishlist: productToDelete._id}
        })

        return res.status(200).json({message: "Product removed from cart successfully.", data: productToDelete})
    } catch (error) {
        res.status(500).json({error: "Not found."})
    }
})

app.get('/wishlist', authenticate, async (req, res) => {
    try {
        const dataForWishlist = await Wishlist.find({userId: req.userId})
        res.status(200).json({message: "Wishlist data.", data: dataForWishlist})
    } catch (error) {
        res.status(500).json({error: "Not found."})
    }
})

async function cartAdd(productData){
    try {
        const cartAddItems = new Cart(productData)
        const cartSave = await cartAddItems.save()
        return cartSave
    } catch (error) {
        console.log(error)
    }
}

app.post('/cartItems', authenticate, async (req, res) => {
    try {
        const saved = await cartAdd({...req.body, userId: req.userId})

        await User.findByIdAndUpdate(req.userId, {
            $push: {cart: saved._id}
        })
        res.status(200).json({message: "Cart Data added successfully.", data: saved})
    } catch (error) {
        res.status(500).json({error: "Not found."})
    }
})

app.get('/cartItems', authenticate, async(req, res) => {
    try {
        const fetchedCartData = await Cart.find({userId: req.userId})
        res.status(200).json({message: "Cart data.", data: fetchedCartData})
    } catch (error) {
        res.status(500).json({error: "Not found."})
    }
})

app.delete("/cartItems/:id", authenticate, async (req, res) => {
    try {
        const dataToDelete = await Cart.findOneAndDelete({id: req.params.id, userId: req.userId})
        if(!dataToDelete){
            res.status(404).json({error: "Cart item not found or already deleted."})
        }
        await User.findByIdAndUpdate(req.userId, {
            $pull: {cart: dataToDelete._id}
        })
        return res.status(200).json({message: "Product removed from cart successfully.", data: dataToDelete})
    } catch (error) {
        res.status(500).json({error: "Not found."})
    }
})

async function addressAdd(productData){
    try {
        const newAddress = new Address(productData)
        const addressSave = await newAddress.save()
        return addressSave
    } catch (error) {
        console.log(error)
    }
}

app.post('/address', authenticate, async (req,res) => {
    try {
        const saved = await addressAdd({...req.body, userId: req.userId})
        console.log("Saved Address userId:", saved.userId);
        await Address.findByIdAndUpdate(req.userId, {
            $push: {addresses: saved._id}
        })
        res.status(200).json({message: "New Address added successfully.", data: saved})

    } catch (error) {
        res.status(401).json({error: "Error adding new address."})
    }
})

app.get('/address', authenticate, async (req, res) => {
    try {
        const fetchedAddress = await Address.find({userId: req.userId})
        // console.log("Fetched Addresses:", fetchedAddress);
        res.status(200).json({message: "Address data", data: fetchedAddress})
    } catch (error) {
        res.status(401).json({error: "Failed to fetch address data."})
    }
})

app.get('/address/:id', authenticate, async (req, res) =>{
    try {
        const addressToDelete = await Address.findOneAndDelete({_id: req.params.id, userId: req.userId})
        if(!addressToDelete){
            res.status(404).json({error: "Address not found."})
        }
        await Address.findByIdAndUpdate(req.userId, {
            $pull: {addresses: addressToDelete._id}
        })
        return res.status(200).json({message: "Address removed from saved addresses.", data: addressToDelete})
    } catch (error) {
        res.status(401).json({error: "Failed to delete address."})
    }
})





const PORT = 3000

app.listen(PORT, (req, res) => {
    console.log("Server connected on port", PORT)
})