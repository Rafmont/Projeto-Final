const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FaturaConsulta = new Schema({
    fatura:{
        type: Schema.Types.ObjectId,
        ref: "faturas",
        required: true
    },
    consulta: {
        type: Schema.Types.ObjectId,
        ref: "consultas"
    }
})

mongoose.model("faturasconsultas", FaturaConsulta)