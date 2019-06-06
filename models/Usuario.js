const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Usuario = new Schema({
    nome: {
        type: String,
        required: true,

    },
    email: {
        type: String,
        required: true
    },
    perfil_usuario: {
        type: Number,
        required: true,
        default: 0
    },
    senha: {
        type: String,
        required: true
    }

})

mongoose.model("usuarios", Usuario)