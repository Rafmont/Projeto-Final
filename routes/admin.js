const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
require("../models/Usuario_Desativado")
require("../models/Evento")
const Evento = mongoose.model("eventos")
const Usuario_Desativado = mongoose.model("usuarios_desativados")
const bcrypt = require("bcryptjs")
const passport = require("passport")
const handlebars = require('express-handlebars');
const moment = require('moment')
require("../models/Hospede")
const Hospede = mongoose.model("hospedes")
require("../models/Terapeuta")
const Terapeuta = mongoose.model("terapeutas")
require("../models/Especialidade")
const Especialidade = mongoose.model("especialidades")
const {verifica_gerente} = require("../helpers/verifica_gerente")
const {verifica_atendente} = require("../helpers/verifica_atendente")
require("../models/ContaAcesso")
const ContaAcesso = mongoose.model("contasacesso")



router.get('/cadastro-evento', verifica_gerente, (req,res) => {
    res.render("eventos/cadastro-evento")
})

router.post('/cadastro-evento', verifica_gerente, (req,res) => {
    var erros = []

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        erros.push({texto: "Titulo inválido."})
    }
    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
        erros.push({texto: "descricao inválida."})
    }
    if(erros.length > 0) {
        res.render("eventos/cadastro-evento", {erros: erros})
    } else {
        var novaData = moment(req.body.data, "YYYY-MM-DD")
        const novoEvento = new Evento({
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            horario: req.body.horario,
            data: novaData
        })
        novoEvento.save().then(() => {
            req.flash("success_msg", "Evento criado com sucesso!")
            res.redirect("/dashboard")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao criar o evento.")
            res.redirect("/dashboard")
        })
    }
})

router.get("/alterar-evento/:id", verifica_gerente, (req, res) => {
    Evento.findOne({_id: req.params.id}).then((evento) => {
        res.render("eventos/alterar-evento", {evento: evento})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar evento")
        res.redirect("/dashboard")
    })
})

router.post("/alterar-evento", verifica_gerente, (req, res) => {
    Evento.findOne({_id: req.body.id}).then((evento) => {
        var novaData = moment(req.body.data, "YYYY-MM-DD")
        evento.titulo = req.body.titulo
        evento.descricao = req.body.descricao
        evento.horario = req.body.horario
        evento.data = novaData
        evento.save().then(() => {
            req.flash("success_msg", "Evento alterado com sucesso!")
            res.redirect("/dashboard")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar dados")
            req.redirect("/dashboard")
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar evento.")
        res.redirect("/dashboard")
    })
})

router.get("/desativar-evento/:id", verifica_gerente, (req, res) => {
    Evento.findOne({_id: req.params.id}).then((evento) => {
        res.render("eventos/desativar-evento", {evento: evento})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar postagem.")
        req.render("dashboard")
    })
})

router.post("/desativar-evento", verifica_gerente, (req, res) => {
    Evento.findOne({_id: req.body.id}).then((evento) => {
        evento.acontecer = false
        evento.save().then(() => {
            req.flash("success_msg", "Evento desativado com sucesso.")
            res.redirect("/dashboard")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao desativar evento.")
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar o evento.")
        res.redirect("/dashboard")
    })
})

router.get("/ver-evento/:id", verifica_atendente, (req, res) => {
    Evento.findOne({_id: req.params.id}).then((evento) => {
        res.render("eventos/ver-evento", {evento: evento})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar o evento.")
        res.redirect("/dashboard")
    })
})

router.get("/especialidades", verifica_atendente, (req, res) => {
    Especialidade.find().then((especialidades) => {
        res.render("terapeutas/especialidades", {especialidades: especialidades})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar Especialidades")
        res.redirect("/dashboard")
    })
})

router.get("/cadastro-especialidade", verifica_gerente, (req, res) => {
    res.render("terapeutas/cadastro-especialidade")
})

router.post("/cadastro-especialidade", verifica_gerente, (req, res) => {
    const novaEspecialidade = new Especialidade({
        nome: req.body.nome,
        descricao: req.body.descricao,
    })
    novaEspecialidade.save().then(() => {
        req.flash("success_msg", "Especialidade cadastrada")
        res.redirect("/admin/especialidades")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao cadastrar especialidade")
        res.redirect("/dashboard")
    })
})

router.get("/alterar-especialidade/:id", verifica_gerente, (req, res) => {
    Especialidade.findOne({_id: req.params.id}).then((especialidade) => {
        res.render("terapeutas/alterar-especialidade", {especialidade: especialidade})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar especialidade")
        res.redirect("/admin/especialidades")
    })
})

router.post("/alterar-especialidade", verifica_gerente, (req, res) => {
    Especialidade.findOne({_id: req.body.id_especialidade}).then((especialidade) => {
        especialidade.nome = req.body.nome,
        especialidade.descricao = req.body.descricao,
        especialidade.save().then(() => {
            req.flash("success_msg", "Especialidade alterada com sucesso!")
            res.redirect("/admin/especialidades")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar a especialidade")
            res.redirect("/admin/especialidades")
        })
    })
})

router.get("/desativar-especialidade/:id", verifica_gerente, (req, res) => {
    Especialidade.findOne({_id: req.params.id}).then((especialidade) => {
        res.render("terapeutas/desativar-especialidade", {especialidade: especialidade})
    }).catch((err) => {
        req.flash("error_msg", "Falha ao encontrar especialidade")
        res.redirect("/admin/especialidades")
    })
})

router.post("/desativar-especialidade", verifica_gerente, (req, res) => {
    Especialidade.findOne({_id: req.body.id_especialidade}).then((especialidade) => {
        especialidade.ativa = false,
        especialidade.save().then(() => {
            req.flash("success_msg", "Especialidade desativada com sucesso!")
            res.redirect("/admin/especialidades")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao desativar especialidade")
            res.redirect("/admin/especialidades")
        })
    }).catch((err) => {
        console.log(err)
        req.flash("error_msg", "Erro ao encontrar especialidade")
        res.redirect("/admin/especialidades")
    })
})

router.get("/cadastro-terapeuta", verifica_gerente, (req, res) => {
    Especialidade.find().then((especialidades) => {
        res.render("terapeutas/cadastro-terapeuta", {especialidades: especialidades})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar especialidades para o cadastro.")
        res.redirect("/dashboard")
    })
     
})

router.post("/cadastro-terapeuta", verifica_gerente, (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: "Nome inválido."})
    }

    if(!req.body.data_nascimento || typeof req.body.data_nascimento == undefined || req.body.data_nascimento == null) {
        erros.push({texto: "Data de nascimento inválida."})
    }

    if(!req.body.rg || typeof req.body.rg == undefined || req.body.rg == null) {
        erros.push({texto: "RG inválido"})
    }

    if(!req.body.cpf || typeof req.body.cpf == undefined || req.body.cpf == null) {
        erros.push({texto: "CPF inválido"})
    }

    if(!req.body.cpf || typeof req.body.cpf == undefined || req.body.cpf == null) {
        erros.push({texto: "CPF inválido"})
    }

    if(!req.body.telefone_1 || typeof req.body.telefone_1 == undefined || req.body.telefone_1 == null) {
        erros.push({texto: "Telefone 1 inválido"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({texto: "Telefone 1 inválido"})
    }

    if(erros.length > 0) {
        res.render("admin/cadastro-terapeuta", {erros: erros})
    }else {
        Terapeuta.findOne({rg: req.body.rg}).then((terapeuta) => {
            if(terapeuta) {
                req.flash("error_msg", "Já existe um terapeuta com este RG.")
                res.redirect("/cadastro-terapeuta")
            } else {
                if (req.body.telefone_2) {
                    tel2 = req.body.telefone_2
                } else {
                    tel2 = 0
                }
                var novaData = moment(req.body.data_nascimento, "YYYY-MM-DD")
                const novoTerapeuta = new Terapeuta({
                    nome: req.body.nome,
                    data_nascimento: novaData,
                    rg: req.body.rg,
                    cpf: req.body.cpf,
                    telefone_1: req.body.telefone_1,
                    telefone_2: tel2,
                    email: req.body.email,
                    especialidade: req.body.especialidade,
                    acerto: req.body.acerto
                })
                novoTerapeuta.save().then(() => {
                    bcrypt.genSalt(10, (erro, salt) => {
                        bcrypt.hash(req.body.senha, salt, (erro, hash) => {
                            if(erro) {
                                req.flash("error_msg", "Houve um erro durante o salvamento do Terapêuta")
                                res.redirect("/dashboard")
                            }
                            const novaContaAcesso = new ContaAcesso({
                                terapeuta: novoTerapeuta._id,
                                login: req.body.login,
                                nome: req.body.nome,
                                nivel_usuario: novoTerapeuta.nivel_usuario,
                                senha: hash,
                            })

                            novaContaAcesso.save().then(() => {
                                req.flash("success_msg", "Terapêuta cadastrado com sucesso!")
                                res.redirect("/dashboard")
                            }).catch((err) => {
                                req.flash("error_msg", "Erro ao criar uma conta de acesso!")
                                res.redirect("/dashboard")
                            })
                        })
                    })
                }).catch((err) => {
                    req.flash("error_msg", "Erro ao salvar novo Terapêuta")
                    res.redirect("/dashboard")
                })
            }    
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno!")
            res.redirect("/dashboard")
        })
        
    }
})

router.get("/alterar-terapeuta", verifica_gerente, (req, res) => {
    Terapeuta.find().then((terapeutas) => {
        Especialidade.find().then((especialidades) => {
            res.render("terapeutas/alterar-terapeuta", {terapeutas: terapeutas, especialidades: especialidades})
        }).catch((err) => {
            req.flash("error_msg", "Erro ao encontrar especialidade")
            res.redirect("/dashboard")
        })
    }).catch((err) => {
        req.flash("error_msg", "Falha ao encontrar os terapêutas")
        res.redirect("/dashboard")
    })
})

router.post("/busca-alterar-terapeuta", verifica_gerente, (req, res) => {
    Terapeuta.findOne({cpf: req.body.busca_cpf}).populate("especialidade").then((terapeuta) => {
        if(terapeuta) {
            Terapeuta.find().then((terapeutas) => {
                Especialidade.find().then((especialidades) => {
                    res.render("terapeutas/alterar-terapeuta", {terapeuta: terapeuta, terapeutas: terapeutas, especialidades: especialidades})
                }).catch((err) => {
                    req.flash("error_msg", "Erro ao encontrar especialidade")
                    res.redirect("/dashboard")
                })
            })
        } else {
            res.flash("error_msg", "Erro ao encontrar terapêuta")
        }   
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar terapeuta!")
        res.redirect("/dashboard")
    })
})

router.post("/alterar-terapeuta", verifica_gerente, (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: "Nome inválido."})
    }

    if(!req.body.data_nascimento || typeof req.body.data_nascimento == undefined || req.body.data_nascimento == null) {
        erros.push({texto: "Data de nascimento inválida."})
    }

    if(!req.body.rg || typeof req.body.rg == undefined || req.body.rg == null) {
        erros.push({texto: "RG inválido"})
    }

    if(!req.body.cpf || typeof req.body.cpf == undefined || req.body.cpf == null) {
        erros.push({texto: "CPF inválido"})
    }

    if(!req.body.cpf || typeof req.body.cpf == undefined || req.body.cpf == null) {
        erros.push({texto: "CPF inválido"})
    }

    if(!req.body.telefone_1 || typeof req.body.telefone_1 == undefined || req.body.telefone_1 == null) {
        erros.push({texto: "Telefone 1 inválido"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({texto: "Telefone 1 inválido"})
    }

    if(erros.length > 0) {
        res.render("admin/cadastro-terapeuta", {erros: erros})
    }else {
        Terapeuta.findOne({_id: req.body._id, ativo: true}).then((terapeuta) => {
            if (req.body.telefone_2) {
                tel2 = req.body.telefone_2
            } else {
                tel2 = 0
            }

            var novaData = moment(req.body.data_nascimento, "YYYY-MM-DD")

            terapeuta.nome = req.body.nome
            terapeuta.data_nascimento = novaData
            terapeuta.rg = req.body.rg
            terapeuta.cpf = req.body.cpf
            terapeuta.telefone_1 = req.body.telefone_1
            terapeuta.telefone_2 = tel2
            terapeuta.email = req.body.email
            terapeuta.especialidade = req.body.especialidade
            terapeuta.acerto = req.body.acerto

            terapeuta.save().then(() => {
                req.flash("success_msg", "Dados alterados com sucesso!")
                res.redirect("/dashboard")
            }).catch((err) => { 
                req.flash("error_msg", "Erro ao salvar dados alterados!")
                res.redirect("/dashboard")
            })

        }).catch((err) => {
            req.flash("error_msg", "Erro ao encontrar terapêta")
            res.redirect("/dashboard")
        })
    }
})

module.exports = router