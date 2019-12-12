const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Requisicao = new Schema ({
    numero: {
        type: Number,
        //required: true,        
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
        //required: true
    },
    valor_total: {
        type: Number,
        //required: true
    },
    status:{
        type: String
    },
    solicitante: {
        type: String
        //type: Schema.Types.ObjectId,
        //ref: "usuarios",
        //required: true
    },

    contrato: {
        type: String
        //type: Schema.Types.ObjectId,
        //ref: "contratos"        
    },
    observacoes: {
        type: String
    },
    prazo_entrega: {
        type: Date
    },
    insumos: [
        {
            descricao:{
                type: String,
                //required: true
            },
            origem: {
                type: String
            },
            codigo_origem:{
                type: String
            },
            unidade: {
                type: String,
                //require: true
            },
            preco: {
                type: Number,                
            },            
            quantidade: {
                type: Number

            },
            preco_total:{
                type: Number
            },
            status_requisicao: {
                type: String
            },
            observacao: {
                type: String,
            },            
        }
    ]
})
mongoose.model("requisicoes", Requisicao)