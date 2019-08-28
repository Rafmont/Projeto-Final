const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Fatura = new Schema({
    hospede:{
        type: Schema.Types.ObjectId,
        ref: "hospedes",
        required: true
    },
    estadia: {
        type: Schema.Types.ObjectId,
        ref: "estadias",
    },
    valor_total:{ 
        type: Number,
        default: 0
    },
    ativa: {
        type: Boolean,
        default: true
    }
})

mongoose.model("faturas", Fatura)