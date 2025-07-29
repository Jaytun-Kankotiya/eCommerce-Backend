const mongoose = require('mongoose')
require('dotenv').config()

// const mongoUri = process.env.MONGODB

const initializedata = async () => {
    await mongoose.connect(process.env.MONGODB).then(() => {
        console.log("Connected to database.")
    }).catch((error) => console.log("Error connecting database."))
}

module.exports = {initializedata}



