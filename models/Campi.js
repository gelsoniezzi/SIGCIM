const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Campus = new Schema({
    nome: {
        type: String
    },
    endereco: {
        type: String
    }
})

mongoose.model("campi", Campus)