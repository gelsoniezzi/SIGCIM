const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Base = new Schema({
    nome: {
        type: String,
        required: true
    },
    abreviacao:{
        type: String,
        maxlength: 15
    },
    endereco: {
        type: String,
        required: true
    }
})

mongoose.model("bases", Base)