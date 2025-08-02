const express = require("express");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
app.use(express.json());

const cors = require("cors");
const { initializedata } = require("./db/db.connect");
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

const Product = require("./models/product.models");
const User = require("./models/userDetails.models");
const Wishlist = require("./models/wishlist.models");
const Cart = require("./models/cart.models");
const Address = require("./models/address.models");
const Orders = require("./models/orders.models");

initializedata();

const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided." });

  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
  if (!token) return res.status(401).json({ error: "Invalid token format." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

app.get("/", async (req, res) => {
    res.send({activeStatus: true, error: false})
})

app.post("/productListing", async (req, res) => {
  try {
    const newData = await Product.insertMany(productsData);
    res
      .status(200)
      .json({ message: "New Product data added successfully.", data: newData });
  } catch (error) {
    res.status(500).json({ error: "Not found." });
  }
});

app.get("/productListing", async (req, res) => {
  try {
    const fetchedProducts = await Product.find();
    if (fetchedProducts) {
      res.json(fetchedProducts);
    } else {
      res.status(404).json({ error: "Failed to fetch the data." });
    }
  } catch (error) {
    res.status(500).json({ error: "Not found." });
  }
});

app.get("/productListing/:category", async (req, res) => {
  try {
    const productByCategory = await Product.find({
      category: req.params.category,
    });
    if (productByCategory) {
      res.json(productByCategory);
    } else {
      res.status(404).json({ error: "Failed to fetch the data by category" });
    }
  } catch (error) {
    res.status(500).json({ error: "Not Found." });
  }
});

app.get("/product_details/:id", async (req, res) => {
  try {
    const productDetails = await Product.findOne({ id: req.params.id });
    if (productDetails) {
      res.json(productDetails);
    } else {
      res.status(404).json({ error: "Failed to fetch the data by id." });
    }
  } catch (error) {
    res.status(500).json({ error: "Not found." });
  }
});

async function addNewUser(userData) {
  try {
    const findUser = await User.findOne({ email: userData.email });
    if (findUser) {
      throw new Error("This is email is already exist, Please Login.");
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const addUserDetails = new User({ ...userData, password: hashedPassword });
    const savedUser = await addUserDetails.save();
    return savedUser;
  } catch (error) {
    throw error;
  }
}

app.get("/allUsers", authenticate, async (req, res) => {
  try {
    const user = await User.find();
    res.status(200).json({ userData: user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch wishlist/cart." });
  }
});

app.get("/userProfile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate("wishlist")
      .populate("cart");
    res.status(200).json({
      userData: user,
      wishlist: user.wishlist,
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch wishlist/cart." });
  }
});

app.post("/userProfile", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists." });
    }
    const addUser = await addNewUser(req.body);
    const token = jwt.sign(
      { userId: addUser._id, email: addUser.email },
      JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.status(200).json({
      message: "User added successfully.",
      user: {
        firstName: addUser.firstName,
        lastName: addUser.lastName,
        email: addUser.email,
      },
      token: token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message || "Failed to add user." });
  }
});

async function fetchUserData(userData) {
  try {
    const fetchUser = await User.findOne({ email: userData.email });
    if (!fetchUser) {
      throw new Error("User not found.");
    }
    const isMatch = await bcrypt.compare(userData.password, fetchUser.password);
    if (!isMatch) {
      throw new Error("Check your Email or password and try again!");
    }
    return fetchUser;
  } catch (error) {
    throw error;
  }
}

app.post("/userProfile/verify", async (req, res) => {
  try {
    const user = await fetchUserData(req.body);
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.status(200).json({
      message: "User Verified successfully.",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    res.status(401).json({ error: error.message || "Failed to verify user." });
  }
});

async function wishlistAdd(productData) {
  try {
    const dataToAdd = new Wishlist(productData);
    const dataSave = await dataToAdd.save();
    return dataSave;
  } catch (error) {
    console.log("Error adding data to wishlist.", error);
  }
}

app.post("/wishlist", authenticate, async (req, res) => {
  try {
    const saved = await wishlistAdd({ ...req.body, userId: req.userId });

    await User.findByIdAndUpdate(req.userId, {
      $push: { wishlist: saved._id },
    });
    res.status(200).json({ message: "Product added to wishlist", data: saved });
  } catch (error) {
    res.status(500).json({ error: "Not found." });
  }
});

app.delete("/wishlist/:id", authenticate, async (req, res) => {
  try {
    const productToDelete = await Wishlist.findOneAndDelete({
      id: req.params.id,
      userId: req.userId,
    });
    if (!productToDelete) {
      res
        .status(404)
        .json({ error: "Cart item not found or already deleted." });
    }

    await User.findByIdAndUpdate(req.userId, {
      $pull: { wishlist: productToDelete._id },
    });

    return res.status(200).json({
      message: "Product removed from cart successfully.",
      data: productToDelete,
    });
  } catch (error) {
    res.status(500).json({ error: "Not found." });
  }
});

app.get("/wishlist", authenticate, async (req, res) => {
  try {
    const dataForWishlist = await Wishlist.find({ userId: req.userId });
    res.status(200).json({ message: "Wishlist data.", data: dataForWishlist });
  } catch (error) {
    res.status(500).json({ error: "Not found." });
  }
});

async function cartAdd(productData) {
  try {
    const cartAddItems = new Cart(productData);
    const cartSave = await cartAddItems.save();
    return cartSave;
  } catch (error) {
    console.log(error);
  }
}

app.post("/cartItems", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('cart')
    const alreadyInCart = user.cart.some((item) => item.id === req.body.id) 

    if(alreadyInCart){
      return res.status(409).json({error: "Product already in cart"})
    }

    const saved = await cartAdd({ ...req.body, userId: req.userId });

    await User.findByIdAndUpdate(req.userId, {
      $push: { cart: saved._id },
    });
    res
      .status(200)
      .json({ message: "Cart Data added successfully.", data: saved });
  } catch (error) {
    res.status(500).json({ error: "Not found." });
  }
});

app.get("/cartItems", authenticate, async (req, res) => {
  try {
    const fetchedCartData = await Cart.find({ userId: req.userId });
    res.status(200).json({ message: "Cart data.", data: fetchedCartData });
  } catch (error) {
    res.status(500).json({ error: "Not found." });
  }
});

app.delete("/cartItems/:id", authenticate, async (req, res) => {
  try {
    const dataToDelete = await Cart.findOneAndDelete({
      id: req.params.id,
      userId: req.userId,
    });
    if (!dataToDelete) {
      res
        .status(404)
        .json({ error: "Cart item not found or already deleted." });
    }
    await User.findByIdAndUpdate(req.userId, {
      $pull: { cart: dataToDelete._id },
    });
    return res.status(200).json({
      message: "Product removed from cart successfully.",
      data: dataToDelete,
    });
  } catch (error) {
    res.status(500).json({ error: "Not found." });
  }
});

async function addressAdd(productData) {
  try {
    const newAddress = new Address(productData);
    const addressSave = await newAddress.save();
    return addressSave;
  } catch (error) {
    console.log(error);
  }
}

app.post("/address", authenticate, async (req, res) => {
  try {
    const saved = await addressAdd({ ...req.body, userId: req.userId });
    await User.findByIdAndUpdate(req.userId, {
      $push: { addresses: saved._id },
    });
    res
      .status(200)
      .json({ message: "New Address added successfully.", data: saved });
  } catch (error) {
    res.status(401).json({ error: "Error adding new address." });
  }
});

app.get("/address", authenticate, async (req, res) => {
  try {
    const fetchedAddress = await Address.find({ userId: req.userId });
    res.status(200).json({ message: "Address data", data: fetchedAddress });
  } catch (error) {
    res.status(401).json({ error: "Failed to fetch address data." });
  }
});

app.delete("/address/:id", authenticate, async (req, res) => {
  try {
    const addressToDelete = await Address.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!addressToDelete) {
      res.status(404).json({ error: "Address not found." });
    }
    return res.status(200).json({
      message: "Address removed from saved addresses.",
      data: addressToDelete,
    });
  } catch (error) {
    res.status(401).json({ error: "Failed to delete address." });
  }
});

app.put("/address/:id", authenticate, async (req, res) => {
  try {
    const addressToUpdate = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true }
    );
    if (!addressToUpdate)
      return res.status(404).json({ error: "Address not found." });

    res.status(200).json({
      message: "Address updated successfully.",
      data: addressToUpdate,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update address." });
  }
});

async function addOrders(orderData) {
  try {
    const ordersToAdd = new Orders(orderData);
    const saveOrder = await ordersToAdd.save();
    return saveOrder;
  } catch (error) {
    throw error;
  }
}

app.post("/orders", authenticate, async (req, res) => {
  try {
    const savedAddresses = await addOrders({ ...req.body, userId: req.userId });
    await User.findByIdAndUpdate(req.userId, {
      $push: { orders: savedAddresses._id },
    });
    await Cart.deleteMany({ userId: req.userId });
    res
      .status(200)
      .json({ message: "New Order Added Successfully.", data: savedAddresses });
  } catch (error) {
    res.status(500).json({ error: "Error adding new order." });
  }
});

app.get("/orders", authenticate, async (req, res) => {
  try {
    const fetchOrders = await Orders.find({ userId: req.userId });
    res.status(200).json({ message: "Orders Data:", data: fetchOrders });
  } catch (error) {
    res.status(401).json({ error: "Error fetching orders list." });
  }
});

app.delete("/orders/:id", authenticate, async (req, res) => {
  try {
    const orderToDelete = await Orders.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!orderToDelete) {
      res.status(404).json({ error: "Order Data not found." });
    }
    res
      .status(200)
      .json({ message: "Oerder deleted successfully.", data: orderToDelete });
  } catch (error) {
    res.status(401).json({ error: "Error deleting orders data." });
  }
});

app.get("/address/default", authenticate, async (req, res) => {
  try {
    const defaultAddressFetch = await Address.findOne({
      userId: req.userId,
      defaultAddress: true,
    });
    if (!defaultAddressFetch) {
        res.status(404).json({ error: "Address not found." });
    } 
    res.status(200).json({ message: "Address fetched", data: defaultAddressFetch });
  } catch (error) {
    res.status(500).json({ error: "Not Found." });
  }
});

app.patch("/address/:id", authenticate, async (req, res) => {
  try {
    if (req.body.defaultAddress === true) {
      await Address.updateMany(
        { userId: req.userId },
        { $set: { defaultAddress: false } }
      );
    }
    const dataToUpdate = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true }
    );
    if (!dataToUpdate)
      return res.status(404).json({ error: "Address data not found." });
    res
      .status(200)
      .json({ message: "Address updated successfully.", data: dataToUpdate });
  } catch (error) {
    res.status(500).json({ error: "Not found" });
  }
});

const PORT = 3000;

app.listen(PORT, (req, res) => {
  console.log("Server connected on port", PORT);
});
