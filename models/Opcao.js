const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Opcao = new Schema({
    nome: {
        type: String,
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: 'categorias',
    },
    ativo: {
        type: Boolean,
        default: true
    }

})

mongoose.model("opcoes", Opcao)