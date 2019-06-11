mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Empresa = new Schema({
    razao_social: {
        type: String,
        required: true
        //default: "Sem nome"
    },
    cnpj: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model("empresas", Empresa)