const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Usuario = new Schema({
    nome: {
        type: String,
        required: true,
    },
    matricula: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    perfil_usuario: { // 1. 
        type: Number,
        required: true,
        default: 5
    },
    senha: {
        type: String,
        required: true
    },
    cargo: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: Boolean,
        required: true,
        default: 1
    }
})

mongoose.model("usuarios", Usuario)