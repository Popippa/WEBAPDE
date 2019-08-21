const mongoose = require("mongoose")

var userSchema = mongoose.Schema({
    u_username: String,
    u_password: String
})

var userModel = mongoose.model("userModel", userSchema)

module.exports = {
    userModel
}

