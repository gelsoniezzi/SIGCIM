const mongoose = require("mongoose")
const mongooseAI = require('mongoose-auto-increment')
const Schema = mongoose.Schema

var connection = mongoose.createConnection("mongodb+srv://sigcim20192ufersa:iknA8o0wOZAVOHtn@cluster0-pv9gh.mongodb.net/SIGCIM?retryWrites=true&w=majority")
mongooseAI.initialize(connection);

const Requisicao = new Schema ({
    ordem_compra: {
        type: Boolean,
        default: false
    },
    numero: {
        type: Number,
        //required: true,        
    },
    numero_ordem: {
        type: Number
    },
    data_criacao: {
        type: Date,
        default: Date.now()
    },
    data_ordem: {
        type: Date,
    },
    prazo_entrega: {
        type: Date
    },
    quantidade_itens: {
        type: Number,
        //required: true
    },
    valor_total: {
        type: Number,
        //required: true
    },
    valor_total_bdi: {
        type: Number
    },
    status:{
        type: String // Salva, [Cancelada] //Solicitada, Pendente, Entregue, [Finalizada], [Cancelada]
    },
    solicitante: {
        type: Schema.Types.ObjectId,
        ref: "usuarios",
        required: true
    },
    campus_destino: {
        type: Schema.Types.ObjectId,
        ref: "campi",
        required: true
    },
    contrato: {        
        type: Schema.Types.ObjectId,
        ref: "contratos"        
    },
    observacoes: {
        type: String
    },
    bdi: {
        type: Number
    },
    cancelada: {
        status: {type: Boolean},
        justificativa: {type: String}
    },
    insumos: [
        {
            id_original: {
                type: String,
            },
            descricao:{
                type: String,
                //required: true
            },
            base_origem: {
                type: Schema.Types.ObjectId,
                ref: "bases"
            },
            codigo_origem:{
                type: String
            },
            unidade_medida: {
                type: String,
                //require: true
            },
            preco_mediano: {
                type: Number,                
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
                type: String, //Solicitado, Entregue, Pendente
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
Requisicao.plugin(mongooseAI.plugin, {model: 'requisicoes', field: 'numero_ordem', startAt: 1});
mongoose.model("requisicoes", Requisicao)
