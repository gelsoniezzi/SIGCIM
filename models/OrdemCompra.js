const mongoose = require("mongoose")
const mongooseAI = require('mongoose-auto-increment')
const Schema = mongoose.Schema

var connection = mongoose.createConnection("mongodb://localhost/sigcim");

mongooseAI.initialize(connection);

const OrdemCompra= new Schema ({
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
        type: String //Solicitada, Pendente, Entregue, Finalizada 
    },
    solicitante: {
        type: Schema.Types.ObjectId,
        ref: "usuarios",
        required: true
    },
    campus_destino: {
        type: String
    },
    contrato: {        
        type: Schema.Types.ObjectId,
        ref: "contratos"        
    },
    observacoes: {
        type: String
    },
    prazo_entrega: {
        type: Date
    },
    bdi: {
        type: Number
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
                type: String
                //require: true
            },
            preco: {
                type: Number          
            },
            preco_bdi: {
                type: Number
            },            
            quantidade: {
                type: Number
            },
            preco_total:{
                type: Number
            },
            preco_total_bdi:{
                type: Number
            },
            status: {
                type: String,
                default: 'Solicitado' // Solicitado, Entregue, Pendente
            },
            observacao_status: {
                type: String
            },
            destino: {
                type: String
            },
            observacao: {
                type: String
            },            
        }
    ]
})
OrdemCompra.plugin(mongooseAI.plugin, {model: 'ordensCompra', field: 'numero', startAt: 1,});
mongoose.model("ordensCompra", OrdemCompra)
