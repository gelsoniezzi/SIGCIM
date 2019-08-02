const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Insumo = new Schema({

    descricao: {
        type: String,
        require: true,

    },
    origem: {
        type: String,
        required: true,
        default: "SIGCIM"
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
    status: {
        type: String,
    },
    imagem: {
        type: String,
        default: "/img/insumos/semimagem.png"
    },
    observacao: {
        type: String,
    },
    coleta: {
        type: Date,
        default: Date.now()
    }    
})

mongoose.model("insumos", Insumo)