const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Base = new Schema({
    nome: {
        type: String,
        required: true
    },
    endereco: {
        type: String,
        required: true
    }
})

mongoose.model("bases", Base)