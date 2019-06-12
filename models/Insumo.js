const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Insumo = new Schema({

    descricao: {
        type: String,
        require: true,

    },
    codigo_origem: {
        type: String,
    },
    unidade_medida: {
        type: String,
        required: true,
        default: "un."
    },
    preco_mediano: {
        type: Number,
        required: true,
        default: 0.0
    },
    


})

mongoose.model("insumos", Insumo)