const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FaturaProduto = new Schema({
    fatura:{
        type: Schema.Types.ObjectId,
        ref: "faturas",
        required: true
    },
    produto: {
        type: Schema.Types.ObjectId,
        ref: "produtos"
    },
    quantidade_produto: {
        type: Number,
        required: true
    },
    valor_unitario_produto: { 
        type: Number,
        required: true
    },
    valor_total_produto: {
        type: Number,
        require: true
    },
    data_compra: {
        type: Date,
        required: true
    }
})

mongoose.model("faturaprodutos", FaturaProduto)