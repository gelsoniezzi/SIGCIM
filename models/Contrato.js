const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Contrato = new Schema({
    numero: {
        type: String,
        required: true
    },
    empresa: {
        type: Schema.Types.ObjectId,
        ref: "empresas",
        required: true
    },
    email: {
        type: String,
        required: true
    },
    fator_reducao: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        required: true,
        default: false
    },
    fiscal: {
        type: String,
        required: true,
    },
    data: {
        type: Date,
        default: Date.now()
    }

})
mongoose.model("contratos", Contrato)