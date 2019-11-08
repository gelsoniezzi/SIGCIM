const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Requisicao = new Schema ({
    numero: {
        type: Number,
        required: true,        
    },
    data_criacao: {
        type: Date,
        default: Date.now()
    },
    data_envio: {
        type: Date,
    },
    quantidade_itens: {
        type: Number,
        required: true
    },
    valor_total: {
        type: Number,
        required: true
    },
    status:{
        type: String
    },
    solicitante: {
        type: Schema.Types.ObjectId,
        ref: "usuarios",
        required: true
    },
    contrato: {
        type: Schema.Types.ObjectId,
        ref: "contratos"        
    }
})
mongoose.model("requisicoes", Requisicao)