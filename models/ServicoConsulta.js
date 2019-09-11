const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ServicoConsulta = new Schema({
    consulta:{
        type: Schema.Types.ObjectId,
        ref: "consultas",
        required: true
    },
    servico: {
        type: Schema.Types.ObjectId,
        ref: "servicos"
    },
})

mongoose.model("servicosconsulta", ServicoConsulta)