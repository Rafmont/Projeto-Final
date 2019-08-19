const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Quarto = new Schema({
    titulo: {
        type: String,
        required: true
    },
    estado: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        required: true
    },
    capacidade: {
        type: Number,
        required: true
    },
    diaria: {
        type: Number,
        required: true
    }
})

mongoose.model("quartos", Quarto)