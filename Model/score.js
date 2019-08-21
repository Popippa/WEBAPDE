const mongoose = require("mongoose")

var scoreSchema = mongoose.Schema({
    playerusername: String,
    difficulty: String,
    score: String
})

var scoreModel = mongoose.model("scoreModel", scoreSchema)

module.exports = {
    scoreModel
}

