const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Categoria = new Schema({
    nome: {
        type: String
    },
    ativo: {
        type: Boolean,
        default: true
    }
})

mongoose.model("categorias", Categoria)