const mongoose = require('mongoose')
require('dotenv').config()

mongoose.connect(process.env.MONGOURL, {
    useNewUrlParser: true,
    useUnifiedTopology: false
}).then(() => {
    console.log("DB CONNECTED")
}).catch((err) => {
    console.log(err)
})

// SETTING USER SCHEMA

const users = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    }
})

const collection = new mongoose.model('users', users)
module.exports = collection