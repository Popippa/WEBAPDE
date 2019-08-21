const mongoose = require("mongoose")

var wordsSchema = mongoose.Schema({
    difficulty: String,
    text: String
})

var wordsModel = mongoose.model("wordsModel", wordsSchema)

module.exports = {
    wordsModel
}

