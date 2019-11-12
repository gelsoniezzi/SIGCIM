const mongoose = require("mongoose")
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema

const Insumo = new Schema({

    descricao: {
        type: String,
        require: true
    },
    origem: {
        type: Schema.Types.ObjectId,
        ref: "bases",
        required: true,
        default: "5dca95bbdeb78b39e4e1257d"
    },
    id_origem: {
        type: Number
    },
    codigo_origem: {
        type: String
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

Insumo.plugin(mongoosePaginate)
mongoose.model("insumos", Insumo)