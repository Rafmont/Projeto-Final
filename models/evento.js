const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Evento = new Schema({
    titulo: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    horario: {
        type: String,
        required: true 
    },
    horario_termino: {
        type: String,
        
    },
    data: {
        type: Date,
        required: true
    },
    data_termino: {
        type: Date,
    },
    data_termino_fc: {
        type: Date,
    },
    acontecer: {
        type: Boolean,
        default: true
    }
})

mongoose.model("eventos", Evento)