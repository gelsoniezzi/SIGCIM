const mongoose = require("mongoose")
const Schema = mongoose.Schema

const InsumoRequisicao = new Schema({
    descricao: {
        type: String,
        require: true
    },
    requisicao_id: {
        type: Schema.Types.ObjectId,
        ref: "requisicoes"
    },
    origem: {
        type: Schema.Types.ObjectId,
        ref: "bases",
    },
    id_origem: {
        type: String
    },
    codigo_origem: {
        type: String
    },
    unidade_medida: {
        type: String,
        required: true
    },
    quantidade: {
        type: Number,
        required: true
    },
    preco_mediano: {
        type: Number,
        required: true,
        default: 0.0
    },
    status: {
        type: String,
    },
    status_requisicao: {
        type: String,
    },
    imagem: {
        type: String,
        default: "/img/insumos/semimagem.png"
    },
    observacao: {
        type: String,
    },
    observacao_requisicao: {
        type: String,
    },
    coleta: {
        type: Date,
        default: Date.now()
    },
    destino: {
        type: String
    }
})

mongoose.model("insumosrequisicoes", InsumoRequisicao)