const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
require("../models/Usuario_Desativado")
const Usuario_Desativado = mongoose.model("usuarios_desativados")
const bcrypt = require("bcryptjs")
const passport = require("passport")
const handlebars = require('express-handlebars');
const moment = require('moment')
require("../models/Evento")
const Evento = mongoose.model("eventos")
require("../models/Servico")
const Servico = mongoose.model("servicos")
require("../models/Hospede")
const Hospede = mongoose.model("hospedes")
require("../models/Fatura")
const Fatura = mongoose.model("faturas")
require("../models/Consulta")
const Consulta = mongoose.model("consultas")
const PDFDocument = require('pdfkit');
const doc = new PDFDocument;
var fs  = require('fs');
require("../models/Produto")
const Produto = mongoose.model("produtos")
require("../models/Quarto")
const Quarto = mongoose.model("quartos")
require("../models/Estadia")
const Estadia = mongoose.model("estadias")
const {verifica_gerente} = require("../helpers/verifica_gerente")
const {verifica_atendente} = require("../helpers/verifica_atendente")
const {verifica_login} = require("../helpers/verifica_login")
const {verifica_clinico} = require("../helpers/verifica_clinico")
require("../models/ContaAcesso")
const ContaAcesso = mongoose.model("contasacesso")
require("../models/Terapeuta")
const Terapeuta = mongoose.model("terapeutas")
require("../models/Fatura-Consulta")
const FaturaConsulta = mongoose.model("faturasconsultas")
require("../models/FaturaProduto")
const FaturaProduto = mongoose.model("faturaprodutos")

router.get('/cadastro-funcionario',  (req, res) => {
    res.render("funcionarios/cadastro-funcionario")
})

router.post('/cadastro-funcionario',  (req, res) => {
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
        res.render("funcionarios/cadastro-funcionario", {erros: erros})
    }else {
        Usuario.findOne({rg: req.body.rg}).then((usuario) => {
            if(usuario) {
                req.flash("error_msg", "Já existe um funcionário com este RG.")
                res.redirect("/cadastro-funcionario")
            } else {
                if (req.body.telefone_2) {
                    tel2 = req.body.telefone_2
                } else {
                    tel2 = 0
                }
                var novaData = moment(req.body.data_nascimento, "YYYY-MM-DD")
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    data_nascimento: novaData,
                    rg: req.body.rg,
                    cpf: req.body.cpf,
                    telefone_1: req.body.telefone_1,
                    telefone_2: tel2,
                    email: req.body.email,
                    nivel_usuario: req.body.nivel_usuario,
                })
                novoUsuario.save().then(() => {
                    bcrypt.genSalt(10, (erro, salt) => {
                        bcrypt.hash(req.body.senha, salt, (erro, hash) => {
                            if(erro) {
                                req.flash("error_msg", "Houve um erro durante o salvamento do funcionário")
                                res.redirect("/dashboard")
                            }
                            const novaContaAcesso = new ContaAcesso({
                                usuario: novoUsuario._id,
                                login: req.body.login,
                                nome: req.body.nome,
                                nivel_usuario: req.body.nivel_usuario,
                                senha: hash,
                            })

                            novaContaAcesso.save().then(() => {
                                req.flash("success_msg", "Usuário cadastrado com sucesso!")
                                res.redirect("/dashboard")
                            }).catch((err) => {
                                req.flash("error_msg", "Erro ao criar uma conta de acesso!")
                                res.redirect("/dashboard")
                            })
                        })
                    })
                }).catch((err) => {
                    req.flash("error_msg", "Erro ao salvar novo usuário")
                    res.redirect("/dashboard")
                })
            }    
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno!")
            res.redirect("/dashboard")
        })
        
    }
})

router.get('/alterar-senha', (req, res) => {
    res.render('funcionarios/alterar-senha')
})

router.post('/alterar-senha', (req, res) => {
    erros = []

    if(req.body.senha_nova1 != req.body.senha_nova2) {
        erros.push({texto: "As senhas não são iguais!"})
    }

    if(erros.length > 0) {
        res.render("funcionarios/alterar-senha", {erros: erros})
    }else {
        ContaAcesso.findOne({_id: req.body.id}).then((contaacesso) => {
            novaSenha = req.body.senha_nova1
            bcrypt.genSalt(10, (erro, salt) => {
                bcrypt.hash(novaSenha, salt, (erro, hash) => {
                    if(erro) {
                        req.flash("error_msg", "Houve um erro ao alterar a senha.")
                        res.redirect("/")
                    }
                    contaacesso.senha = hash
                    contaacesso.save().then(() => {
                        req.flash("success_msg", "Senha alterada com sucesso!")
                        res.redirect("/dashboard")
                    }).catch((err) => {
                        req.flash("error_msg", "Houve um erro ao alterar a senha.")
                        res.redirect("/usuario/alterar-senha")
                    })
                })
            })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao encontrar o cadastro no banco de dados.")
            res.redirect("/usuario/alterar-senha")
        })
    }
})

router.get("/alterar-funcionario",verifica_gerente, (req, res) => {
    res.render("funcionarios/alterar-funcionario")
})

router.post("/busca-alterar-funcionario",verifica_gerente, (req, res) => {
    Usuario.findOne({cpf: req.body.busca_cpf}).then((usuario) => {
        if(usuario) {
            res.render("funcionarios/alterar-funcionario", {usuario: usuario})
        }else {
            req.flash("error_msg", "Não encontramos um funcionario com este CPF.")
            res.redirect("alterar-funcionario")
        }
    }).catch((err) => {
        res.flash("error_msg", "Houve um erro ao encontrar o funcionario.")
    })
})
    
router.post("/alterar-funcionario", verifica_gerente, (req, res) => {
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
        res.render("funcionarios/alterar-funcionario", {erros: erros})
    }else {
        Usuario.findOne({cpf: req.body.cpf}).then((usuario) => {
            if (req.body.telefone_2) {
                tel2 = req.body.telefone_2
            } else {
                tel2 = 0
            }

            var novaData = moment(req.body.data_nascimento, "YYYY-MM-DD")

            usuario.nome = req.body.nome;
            usuario.data_nascimento = novaData;
            usuario.rg = req.body.rg;
            usuario.cpf = req.body.cpf;
            usuario.telefone_1 = req.body.telefone_1;
            usuario.telefone_2 = tel2;
            usuario.email = req.body.email;
            usuario.nivel_usuario = req.body.nivel_usuario;
            console.log("Usuario" + usuario.data_nascimento + "/n form: " + req.body.data_nascimento)
            
            usuario.save().then(() => {
                req.flash("success_msg", "Usuário alterado com sucesso!");
                res.redirect("/dashboard")
            }).catch((err) => {
                req.flash("error_msg", "Erro ao salvar usuário!")
            })

        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar edição.")
            res.redirect("/dashboard")
            console.log(err)
        })
    }
})

router.get("/desativar-funcionario",verifica_gerente, (req, res) => {
    res.render("funcionarios/desativar-funcionario")
})

router.post("/busca-desativar-usuario",verifica_gerente, (req, res) => {
    Usuario.findOne({cpf: req.body.busca_cpf}).then((usuario) => {
        if(usuario) {
            res.render("funcionarios/desativar-funcionario", {usuario: usuario})
        }else {
            req.flash("error_msg", "Não encontramos um funcionario com este CPF.")
            res.redirect("alterar-funcionario")
        }
    }).catch((err) => {
        res.flash("error_msg", "Houve um erro ao encontrar o funcionario.")
    })
})

router.post("/desativar-usuario",verifica_gerente, (req, res) => {
    const desativarUsuario = new Usuario_Desativado({
        nome: req.body.nome,
        data_nascimento: req.body.data_nascimento,
        rg: req.body.rg,
        cpf: req.body.cpf,
        telefone_1: req.body.telefone_1,
        telefone_2: req.body.telefone_2,
        email: req.body.email,
        nivel_usuario: req.body.nivel_usuario,
    })
    desativarUsuario.save().then(() => {
        Usuario.deleteOne({cpf: req.body.cpf}).then(() => {
            req.flash("success_msg", "Usuário deletado com sucesso!")
            res.redirect("/dashboard")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao desativar usuário.")
            res.redirect("/desativar-usuario")  
            console.log(err + "No primeiro DELETE")
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao desativar usuário.")
        res.redirect("/desativar-usuario")
        console.log(err + "No SAVE")
    })   
})

router.get("/servicos", (req, res) => {
    Servico.find().sort({nome: "desc"}).then((servicos) => {
        res.render("clinicos/servicos", {servicos: servicos})
    }).catch((err) => {
        req.flash("error_msg", "Não foi possível buscar os serviços.")
        res.redirect("/usuarios/servicos")
    })
})

router.get("/cadastro-servico", verifica_atendente, (req, res) => {
    res.render("clinicos/cadastro-servico")
})

router.post("/cadastro-servico", verifica_atendente, (req, res) => {

    const novoServico = new Servico({
        nome: req.body.titulo,
        descricao: req.body.descricao,
        valor: req.body.valor
    }) 
    novoServico.save().then(() => {
        req.flash("success_msg", "Serviço cadastrado com sucesso!")
        res.redirect("/usuario/servicos")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao cadastrar o serviço.")
        res.redirect("/usuario/cadastro-servico")
    })

})

router.get("/desativar-servico/:id", verifica_atendente, (req, res) => {
    Servico.findOne({_id: req.params.id}).then((servico) => {
        res.render("clinicos/desativar-servico", {servico: servico})
    }).catch((err) => {
        req.flash("seccess_msg", "Falha ao encontrar serviço")
        res.redirect("/usuario/servicos")
    })
})

router.post("/desativar-servico", verifica_atendente, (req, res) => {
    Servico.findOne({_id: req.body.id}).then((servico) => {
        servico.ativo = false
        servico.save().then(() => {
            req.flash("success_msg", "Serviço desativado.")
            res.redirect("/usuario/servicos")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar desativação")
            res.redirect("/usuario/servicos")
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar serviço")
        res.redirect("/usuario/servicos")
        console.log(err)
    })
})

router.get("/alterar-servico/:id", verifica_atendente, (req, res) => {
    Servico.findOne({_id: req.params.id}).then((servico) => {
        res.render("clinicos/alterar-servico", {servico:servico})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar servico.")
        res.redirect("/usuario/servicos")
    })
})

router.post("/alterar-servico", verifica_atendente, (req, res) => {
    Servico.findOne({_id: req.body.id}).then((servico) => {
        servico.nome = req.body.titulo
        servico.descricao = req.body.descricao
        servico.valor = req.body.valor
        servico.save().then(() => { 
            req.flash("success_msg", "Alterações realizadas com sucesso!")
            res.redirect("/usuario/servicos")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar alterações")
            res.redirect("/usuario/servicos")
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar servico")
        res.redirect("/usuario/servicos")
    })
})  


router.get("/cadastro-hospedes", verifica_atendente, (req, res) => {
    res.render("hospedes/cadastro-hospede")
})

router.post("/cadastro-hospedes", verifica_atendente, (req, res) => {
    Hospede.findOne({cpf: req.body.cpf}).then((hospede) => {
        if (hospede) {
            req.flash("error_msg", "Erro, já existe um hóspede com este CPF")
            res.redirect("/usuario/cadastro-hospedes")
        } else {
            if (req.body.telefone_2) {
                tel2 = req.body.telefone_2
            } else {
                tel2 = 0
            }
            var novaData = moment(req.body.data_nascimento, "YYYY-MM-DD")

            const novoHospede = new Hospede({
                nome: req.body.nome,
                data_nascimento: novaData,
                rg: req.body.rg,
                cpf: req.body.cpf,
                telefone_1: req.body.telefone_1,
                telefone_2: tel2,
                email: req.body.email,
                observacoes: req.body.observacoes
            })

            novoHospede.save().then(() => {
                req.flash("success_msg", "Hóspede cadastrado com sucesso")
                res.redirect("/dashboard")
            }).catch((err) => {
                req.flash("error_msg", "Erro ao salvar hóspede no banco")
                res.redirect("/usuario/cadastro-hospede")
            })
        }
    })
})

router.get("/alterar-hospedes", verifica_atendente, (req, res) => {
    res.render("hospedes/alterar-hospedes")
})

router.post("/busca-alterar-hospedes", verifica_atendente, (req, res) => {
    Hospede.findOne({cpf: req.body.busca_cpf}).then((hospede) => {
        if(hospede && hospede.ativo == true){
            res.render("hospedes/alterar-hospedes", {hospede: hospede})
        }else {
            req.flash("error_msg", "Não foi possível encontrar um hóspede com este CPF")
            res.redirect("/usuario/alterar-hospedes")
        }
        
    }).catch((err) => {
        req.flash("error_msg", "Erro ao buscar o CPF no banco.")
        res.redirect("/usuario/alterar-hospede")
    })
})

router.post("/alterar-hospedes", verifica_atendente, (req, res) => {
    Hospede.findOne({cpf: req.body.cpf_antigo}).then((hospede) => {
        if(hospede && hospede.ativo == true) {
            if (req.body.telefone_2) {
                tel2 = req.body.telefone_2
            } else {
                tel2 = 0
            }
            var novaData = moment(req.body.data_nascimento, "YYYY-MM-DD")

            hospede.nome = req.body.nome,
            hospede.data_nascimento = novaData,
            hospede.rg = req.body.rg,
            hospede.cpf = req.body.cpf,
            hospede.telefone_1 = req.body.telefone_1,
            hospede.telefone_2 = tel2,
            hospede.email = req.body.email,
            hospede.observacoes = req.body.observacoes

            hospede.save().then(() => {
                req.flash("success_msg", "Hóspede alterado com sucesso!")
                res.redirect("/dashboard")
            }).catch((err) => {
                req.flash("error_msg", "Erro ao salvar alterações, tente novamente")
                res.render("hospedes/alterar-hospedes", {hospede: hospede})
            })
        }else{
            req.flash("error_msg", "Houve um erro ao alterar o hóspede")
            res.redirect("/usuario/alterar-hospedes")
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao sincronizar com o cpf, tente novamente")
        res.redirect("/usuario/alterar-hospedes")
    })
})

router.get("/desativar-hospedes", verifica_atendente, (req, res) => {
    res.render("hospedes/desativar-hospedes")
})

router.post("/busca-desativar-hospedes", verifica_atendente, (req, res) => {
    Hospede.findOne({cpf: req.body.busca_cpf}).then((hospede) => {
        if(hospede && hospede.ativo == true){
            res.render("hospedes/desativar-hospedes", {hospede: hospede})
        }else {
            req.flash("error_msg", "Não foi possível encontrar um hóspede com este CPF")
            res.redirect("/usuario/desativar-hospedes")
        }
        
    }).catch((err) => {
        req.flash("error_msg", "Erro ao buscar o CPF no banco.")
        res.redirect("/usuario/desativar-hospede")
    })
})

router.post("/desativar-hospedes", verifica_atendente, (req, res) => {
    Hospede.findOne({cpf: req.body.cpf_antigo}).then((hospede) => {
        hospede.ativo = false
        hospede.save().then(() => {
            req.flash("success_msg", "Hóspede desativado com sucesso")
            res.redirect("/dashboard")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao executar desativação")
            res.redirect("/usuario/desativar-hospedes")
        })
    })
})

router.get("/escolher-clinico", verifica_atendente, (req, res) => {
    Usuario.find().then((usuarios) => {
        res.render("clinicos/escolher-clinico", {usuarios: usuarios})
    }).catch((err) => {
        req.flash("error_msg", "Não foi possível buscar os clínicos")
        res.redirect("/dashboard")
    })
})

router.get("/agendar-atendimento", verifica_atendente, (req, res) => {
    Servico.find().then((servicos) => {
        Terapeuta.find({ativo: true}).then((terapeutas) => {
             Hospede.find().then((hospedes) => {
                res.render("clinicos/agendar-atendimento", {servicos: servicos, terapeutas: terapeutas, hospedes: hospedes})
             }).catch((err) => {
                 req.flash("error_msg", "Não foi possível encontrar os hóspedes")
                 res.redirect("/dashboard")
             })
           
        }).catch((err) => {
            req.flash("error_msg", "Não foi possível encontrar os clinicos.")
            res.redirect("/dashboard")
        })
    }).catch((err) => {
        req.flash("error_msg", "Não foi possível encontrar os serviços")
        res.redirect("/dashboard")
        console.log(err)
    })

})

//Rotina de agendar o atendimento, verifica se o cliente já possui uma fatura em aberto no sistema.
router.post("/agendar-atendimento", verifica_atendente, (req, res) => {
    Hospede.findOne({cpf: req.body.cpf_hospede}).then((hospede) => {
        Fatura.findOne({hospede: hospede._id, ativa: true}).then((fatura) => {
            if(fatura) {
                Servico.findOne({_id: req.body.servico}).then((servico) => {
                    Terapeuta.findOne({cpf: req.body.cpf_terapeuta}).then((terapeuta) => {
                        const novaConsulta = new Consulta({
                            terapeuta: terapeuta._id,
                            cliente: hospede._id,
                            servico: req.body.servico,
                            sala: req.body.sala,
                            data_consulta: req.body.data_consulta,
                            horario: req.body.horario,
                            valor_consulta: servico.valor,
                            fatura: fatura._id
                        })
                        novaConsulta.save().then(() => {
                            const novaFaturaConsulta = new FaturaConsulta({
                                fatura: fatura._id,
                                consulta: novaConsulta._id,
                            })
                            novaFaturaConsulta.save().then(() => {
                                novaConsulta.faturaconsulta = novaFaturaConsulta._id
                                novaConsulta.save().then(() => {
                                    valor_anterior = fatura.valor_total,
                                    novo_valor = valor_anterior + servico.valor,
                                    fatura.valor_total = novo_valor
                                    fatura.save().then(() => {
                                        req.flash("success_msg", "Sucesso ao agendar consulta!")
                                        res.redirect("/dashboard")
                                    }).catch((err) => {
                                        req.flash("error_msg", "Erro ao atualizar valor total de fatura!")
                                        res.redirect("/dashboard")
                                        console.log(err)
                                    })
                                }).catch((err) => {
                                    req.flash("error_msg", "Erro ao atualizar consulta referente fatura")
                                    res.redirect("/dashboard")
                                })
                            }).catch((err) => {
                                req.flash("error_msg", "Erro ao salvar fatura-consulta")
                                res.redirect("/dashboard")
                                console.log(err)
                            })
                        }).catch((err) => {
                            req.flash("error_msg", "Erro ao salvar nova consulta!")
                            res.redirect("/dashboard")
                            console.log(err)
                        })
                    }).catch((err) => {
                        req.flash("error_msg", "Erro ao encontrar o terapêuta!")
                        res.redirect("/dashboard")
                        console.log(err)
                    })
                }).catch((err) => {
                    req.flash("error_msg", "Erro ao encontrar serviço!")
                    res.redirect("/dashboard")
                    console.log(err)
                })
            } else {
                const novaFatura = new Fatura({
                    hospede: hospede._id,
                })
                novaFatura.save().then(() => {
                    Terapeuta.findOne({cpf: req.body.cpf_terapeuta}).then((terapeuta) => {
                        Servico.findOne({_id: req.body.servico}).then((servico) => {
                            const novaConsulta = new Consulta({
                                terapeuta: terapeuta._id,
                                cliente: hospede._id,
                                servico: req.body.servico,
                                sala: req.body.sala,
                                data_consulta: req.body.data_consulta,
                                horario: req.body.horario,
                                valor_consulta: servico.valor,
                                fatura: novaFatura._id
                            })
                            novaConsulta.save().then(() => {
                                const novaFaturaConsulta = new FaturaConsulta({
                                    fatura: novaFatura._id,
                                    consulta: novaConsulta._id,
                                })
                                novaFaturaConsulta.save().then(() => {
                                    novaConsulta.faturaconsulta = novaFaturaConsulta._id
                                    novaConsulta.save().then(() => {
                                        valor_anterior = novaFatura.valor_total,
                                        novo_valor = valor_anterior + servico.valor,
                                        novaFatura.valor_total = novo_valor
                                        novaFatura.save().then(() => {
                                            req.flash("success_msg", "Sucesso ao agendar consulta!")
                                            res.redirect("/dashboard")
                                        }).catch((err) => {
                                            req.flash("error_msg", "Erro ao atualizar valor total de fatura!")
                                            res.redirect("/dashboard")
                                            console.log(err)
                                        })
                                    }).catch((err) => {
                                        req.flash("error_msg", "Erro ao atualizar consulta referente fatura")
                                        res.redirect("/dashboard")
                                    })
                                }).catch((err) => {
                                    req.flash("error_msg", "Erro ao salvar fatura-consulta")
                                    res.redirect("/dashboard")
                                    console.log(err)
                                })
                            }).catch((err) => {
                                req.flash("error_msg", "Erro ao salvar consulta!")
                                res.redirect("/dashboard")
                                console.log(err)
                            })
                        }).catch((err) => {
                            req.flash("error_msg", "Erro ao encontrar serviço!")
                            res.redirect("/dashboard")
                            console.log(err)
                        })
                    }).catch((err) => {
                        req.flash("error_msg", "Erro ao buscar terapêuta!")
                        res.redirect("/dashboard")
                        console.log(err)
                    })
                }).catch((err) => {
                    req.flash("error_msg", "Erro ao salvar fatura!")
                    res.redirect("/dashboard")
                    console.log(err)
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Erro ao encontrar fatura!")
            res.redirect("/dashboard")
            console.log(err)
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar hóspede no banco de dados!")
        res.redirect("/dashboard")
        console.log(err)
    })
})

router.get("/atendimentos-marcados", verifica_atendente, (req, res) => {
    Consulta.find().populate("servico").populate("cliente").populate("clinico").then((consultas) => {
        res.render("clinicos/atendimentos-marcados", {consultas: consultas})
    }).catch((err) => {
        req.flash("Não foi possível encontrar as consultas.")
        res.redirect("/dashboard")
    })
})

//Rota que retorna as consultas de apenas um clínico
router.get("/atendimentos-marcados/:id", verifica_clinico, (req, res) => {
    Consulta.find({terapeuta: req.params.id}).then((consultas) => {
        console.log(consultas)
        res.render("clinicos/atendimentos-marcados", {consultas: consultas})
    }).catch((err) => {
        req.flash("Não foi possível encontrar as consultas.")
        res.redirect("/dashboard")
    })
})

router.get("/pdf-consultas", (req, res) => {
    // Pipe its output somewhere, like to a file or HTTP response
    // See below for browser usage
    doc.pipe(fs.createWriteStream('output.pdf'));
     

     
    // Add another page
    doc.addPage()
       .fontSize(25)
       .text('Here is some vector graphics...', 100, 100);
     
    // Draw a triangle
    doc.save()
       .moveTo(100, 150)
       .lineTo(100, 250)
       .lineTo(200, 250)
       .fill("#FF3300");
     
    // Apply some transforms and render an SVG path with the 'even-odd' fill rule
    doc.scale(0.6)
       .translate(470, -380)
       .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
       .fill('red', 'even-odd')
       .restore();
     
    // Add some text with annotations
    doc.addPage()
       .fillColor("blue")
       .text('Here is a link!', 100, 100)
       .underline(100, 100, 160, 27, {color: "#0000FF"})
       .link(100, 100, 160, 27, 'http://google.com/');
     
    // Finalize PDF file
    doc.end();
})

router.get("/check-in", verifica_atendente, (req, res) => {
    res.render("hospedes/check-in")
})

router.get("/cupom", (req, res) => {
    res.render("hospedes/cupom-fiscal")
})

router.get("/produtos", verifica_login, (req, res) => {
    Produto.find().sort({nome: "desc"}).then((produtos) => {
        res.render("produtos/produtos", {produtos: produtos})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar produto")
        res.redirect("/dashboard")
    })
})

router.get("/cadastro-produto", verifica_atendente, (req, res) => {
    res.render("produtos/cadastro-produto");
})

router.post("/cadastro-produto", verifica_atendente, (req, res) => {
    const novoProduto = new Produto({
        nome: req.body.nome,
        descricao: req.body.descricao,
        valor_unitario: req.body.valor_unitario
    })
    novoProduto.save().then(() => {
        req.flash("success_msg", "Produto cadastrado com sucesso!")
        res.redirect("/dashboard")
    }).catch((err) => {
        console.log(err)
        req.flash("error_msg", "Erro ao cadastrar novo produto, tente novamente!")
        res.redirect("/dashboard")
    })
})

router.get("/alterar-produto/:id", verifica_atendente, (req, res) => {
    Produto.findOne({_id: req.params.id}).then((produto) => {
        res.render("produtos/alterar-produto", {produto: produto})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar produto.")
        res.redirect("/usuario/produtos")
    })
})

router.post("/alterar-produto", verifica_atendente, (req, res) => {
    Produto.findOne({_id: req.body.id_produto}).then((produto) => {
        produto.nome = req.body.nome,
        produto.descricao = req.body.descricao,
        produto.valor_unitario = req.body.valor_unitario

        produto.save().then(() => {
            req.flash("success_msg", "Produto alterado com sucesso!")
            res.redirect("/usuario/produtos")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao atualizar o produto")
            res.redirect("/usuario/produtos")
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar produto")
        res.redirect("/usuario/produtos")
    })
})

router.get("/desativar-produto/:id", verifica_atendente, (req, res) => {
    Produto.findOne({_id: req.params.id}).then((produto) => {
        res.render("produtos/desativar-produto", {produto: produto})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar produto.")
        res.redirect("/usuario/produtos")
    })
})

router.post("/desativar-produto", verifica_atendente, (req, res) => {
    Produto.deleteOne({_id: req.body.id_produto}).then(() => {
        req.flash("success_msg", "Produto desativado com sucesso.")
        res.redirect("/usuario/produtos")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao desativar produto.")
        res.redirect("/usuario/produtos")
    })
})

router.get("/quartos", verifica_login, (req, res) => {
    Quarto.find().sort({nome: "desc"}).then((quartos) => {
        Estadia.find({ativa: true}).populate("quarto").populate("hospede").populate("fatura").then((estadias) => {
            res.render("quartos/quartos", {quartos: quartos, estadias: estadias})
        }).catch((err) => {
            req.flash("error_msg", "Erro ao encontrar estadias.")
        })
        
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar quarto")
        res.redirect("/dashboard")
    })
})

router.get("/cadastro-quarto", verifica_atendente, (req, res) => {
    res.render("quartos/cadastro-quarto");
})

router.post("/cadastro-quarto", verifica_atendente, (req, res) => {
    const novoQuarto = new Quarto({
        titulo: req.body.titulo,
        estado: req.body.estado,
        tipo: req.body.tipo,
        capacidade: req.body.capacidade,
        diaria: req.body.diaria
    })
    novoQuarto.save().then(() => {
        req.flash("success_msg", "Quarto cadastrado com sucesso!")
        res.redirect("/usuario/quartos")
    }).catch((err) => {
        console.log(err)
        req.flash("error_msg", "Erro ao cadastrar novo quarto, tente novamente!")
        res.redirect("/usuario/quartos")
    })
})

router.get("/alterar-quarto/:id", verifica_atendente, (req, res) => {
    Quarto.findOne({_id: req.params.id}).then((quarto) => {
        res.render("quartos/alterar-quarto", {quarto: quarto})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar quarto.")
        res.redirect("/usuario/quartos")
    })
})

router.post("/alterar-quarto", verifica_atendente, (req, res) => {
    Quarto.findOne({_id: req.body.id_quarto}).then((quarto) => {
        quarto.titulo = req.body.titulo
        quarto.estado = req.body.estado
        quarto.tipo = req.body.tipo
        quarto.capacidade = req.body.capacidade
        quarto.diaria = req.body.diaria

        quarto.save().then(() => {
            req.flash("success_msg", "Quarto alterado com sucesso!")
            res.redirect("/usuario/quartos")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao atualizar o quarto")
            res.redirect("/usuario/quartos")
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar quarto")
        res.redirect("/usuario/quartos")
    })
})

router.get("/desativar-quarto/:id", verifica_atendente, (req, res) => {
    Quarto.findOne({_id: req.params.id}).then((quarto) => {
        res.render("quartos/desativar-quarto", {quarto: quarto})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar quarto.")
        res.redirect("/usuario/quartos")
    })
})

router.post("/desativar-quarto", verifica_atendente, (req, res) => {
    Quarto.deleteOne({_id: req.body.id_quarto}).then(() => {
        req.flash("success_msg", "Quarto desativado com sucesso.")
        res.redirect("/usuario/quartos")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao desativar quarto.")
        res.redirect("/usuario/quartos")
    })
})

router.get("/check-in/:id", verifica_atendente, (req, res) => {
    Quarto.findOne({_id: req.params.id}).then((quarto) => {
        Hospede.find().then((hospedes) => {
            res.render("quartos/check-in", {quarto: quarto, hospedes: hospedes})
        }).catch((err) => {
            req.flash("error_msg", "Erro ao encontrar os hóspedes.")
            res.redirect("/dashboard")
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar quarto.")
        res.redirect("/usuario/quartos")
    })
})

router.post("/check-in", verifica_atendente, (req, res) => {
    Hospede.findOne({cpf: req.body.cpf_hospede}).then((hospede) => {
        Fatura.findOne({hospede: hospede._id, ativa: true}).then((fatura) => {
            if(fatura) {
                var novaData = moment(req.body.data_saida, "YYYY-MM-DD")
                //Cálculo dos dias da estadia utilizando moment.js
                var a = moment(Date.now())
                var b = moment(req.body.data_saida)
                var duration = moment.duration(a.diff(b))
                var dias = duration.asDays();
                var dias = dias * -1
                var dias = dias + 1
                var diarias = Math.round(dias)
                //--
                const novaEstadia = new Estadia({
                    quarto: req.body.id_quarto,
                    hospede: hospede._id,
                    fatura: fatura._id,
                    diarias: diarias,
                    data_saida: novaData
                })
                novaEstadia.save().then(() => {
                    Quarto.findOne({_id: req.body.id_quarto}).then((quarto) => {
                        quarto.estado = "ocupado"
                        quarto.save().then(() => {
                            valor_anterior = fatura.valor_total,
                            valor_estadia = quarto.diaria * novaEstadia.diarias
                            novo_valor = valor_anterior + valor_estadia,
                            fatura.valor_total = novo_valor
                            fatura.save().then(() => {
                                novaEstadia.valor_estadia = valor_estadia
                                novaEstadia.save().then(() => {
                                    req.flash("success_msg", "Estadia realizada com sucesso!")
                                    res.redirect("/usuario/quartos")
                                }).catch((err) => {
                                    req.flash("error_msg", "Erro ao salvar valor da estadia!")
                                    res.redirect("/usuario/quartos")
                                })            
                            }).catch((err) => {
                                req.flash("error_msg", "Erro ao salvar fatura!!")
                                res.redirect("/dashboard")
                                console.log(err)
                            })
                        }).catch((err) => {
                            req.flash("error_msg", "Erro ao salvar quarto!")
                            res.redirect("/dashboard")
                            console.log(err)
                        })
                    }).catch((err) => {
                        req.flash("error_msg", "Erro ao encontrar quarto!")
                        res.redirect("/dashboard")
                        console.log(err)
                    })
                }).catch((err) => {
                    req.flash("error_msg", "Erro ao salvar nova estadia!")
                    res.redirect("/dashboard")
                    console.log(err)
                })
            } else {
                const novaFatura = new Fatura({
                    hospede: hospede._id
                })
                novaFatura.save().then(() => {
                    hospede.fatura = novaFatura._id
                    hospede.save().then(() => {
                        var novaData = moment(req.body.data_saida, "YYYY-MM-DD")
                        //Cálculo dos dias da estadia utilizando moment.js
                        var a = moment(Date.now())
                        var b = moment(req.body.data_saida)
                        var duration = moment.duration(a.diff(b))
                        var dias = duration.asDays();
                        var dias = dias * -1
                        var dias = dias + 1
                        var diarias = Math.round(dias)
                        //--
                        const novaEstadia = new Estadia({
                            quarto: req.body.id_quarto,
                            hospede: hospede._id,
                            fatura: novaFatura._id,
                            diarias: diarias,
                            data_saida: novaData
                        })
                        novaEstadia.save().then(() => {
                            Quarto.findOne({_id: req.body.id_quarto}).then((quarto) => {
                                quarto.estado = "ocupado"
                                quarto.save().then(() => {
                                    valor_anterior = novaFatura.valor_total,
                                    valor_estadia = quarto.diaria * novaEstadia.diarias
                                    novo_valor = valor_anterior + valor_estadia,
                                    novaFatura.valor_total = novo_valor
                                    novaFatura.save().then(() => {
                                        novaEstadia.valor_estadia = valor_estadia
                                        novaEstadia.save().then(() => {
                                            req.flash("success_msg", "Estadia realizada com sucesso!")
                                            res.redirect("/usuario/quartos")
                                        }).catch((err) => {
                                            req.flash("error_msg", "Erro ao salvar valor da estadia!")
                                            res.redirect("/usuario/quartos")
                                        })    
                                    }).catch((err) => {
                                        req.flash("error_msg", "Erro ao salvar fatura!!")
                                        res.redirect("/dashboard")
                                        console.log(err)
                                    })
                                }).catch((err) => {
                                    req.flash("error_msg", "Erro ao salvar quarto!")
                                    res.redirect("/dashboard")
                                    console.log(err)
                                })
                            }).catch((err) => {
                                req.flash("error_msg", "Erro ao encontrar quarto!")
                                res.redirect("/dashboard")
                                console.log(err)
                            })
                        }).catch((err) => {
                            req.flash("error_msg", "Erro ao salvar nova estadia!")
                            res.redirect("/dashboard")
                            console.log(err)
                        })
                    }).catch((err) => {
                        req.flash("error_msg", "Erro ao adicionar fatura ao hóspede!")
                        res.redirect("/dasboard")
                        console.log(err)
                    })
                }).catch((err) => {
                    req.flash("error_msg", "Erro ao salvar nova fatura!")
                    res.redirect("/dashboard")
                    console.log(err)
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Erro ao encontrar fatura!")
            res.redirect("/usuario/quartos")
            console.log(err)
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar hóspede.")
        res.redirect("/usuario/quartos")
    })
})

router.get("/check-out/:id", verifica_atendente, (req, res) => {
    Estadia.findOne({quarto: req.params.id, ativa: true}).populate("quarto").populate("hospede").populate("fatura").then((estadia) => {
        res.render("quartos/check-out", {estadia: estadia})
    }).catch((err) => {
        req.flash("error_msg", "Não foi possível encontrar a estadia.")
        res.redirect("/usuario/quartos")
    })
})

router.post("/check-out", verifica_atendente, (req, res) => {
    Estadia.findOne({quarto: req.body.id_quarto, ativa: true}).then((estadia) => {
        estadia.ativa = false
        estadia.save().then(() => {
            Quarto.findOne({_id: estadia.quarto._id}).then((quarto) => {
                quarto.estado = "disponivel"
                quarto.save().then(() => {
                    req.flash("success_msg", "Check-out realizado com sucesso!")
                    res.redirect("/usuario/quartos")
                }).catch((err) => {
                    req.flash("error_msg", "Erro ao salvar estado do quarto.")
                    res.redirect("/usuario/quartos")
                })
            }).catch((err) => {
                req.flash("error_msg", "Erro ao encontrar quarto.")
                res.redirect("/usuario/quartos")
            })
        }).catch((err) => {
            req.flash("error_msg", "Erro ao realizar o Check-out!")
            res.redirect("/usuario/quartos")
        })
    }).catch((err) => {
        req.flash("error_msg", "Não foi possível encontrar a estadia.")
        res.redirect("/usuario/quartos")
    })
})

router.get("/relatorio-estadia", verifica_atendente, (req, res) => {
    Estadia.find().populate("quarto").populate("hospede").populate("fatura").then((estadias) => {
        res.render("quartos/relatorio-estadia", {estadias: estadias})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar estadias.")
        res.redirect("/dashboard")
    })
})

router.post("/busca-estadia", verifica_atendente, (req, res) => {
    var data_inicial = moment(req.body.busca_data_inicial).format('YYYY-MM-DD')
    if(!req.body.busca_data_final){
        Estadia.find({data_entrada : {$gte: data_inicial}}).populate("quarto").populate("hospede").populate("fatura").then((estadias) => {
            res.render("quartos/relatorio-estadia", {estadias: estadias})
        }).catch((err) => {
            req.flash("error_msg", "Erro ao realizar a pesquisa avançada, tente novamente.")
            res.redirect("/usuario/relatorio-estadia")
            console.log(err)
        })
    }else {
        var data_final = moment(req.body.busca_data_final).format('YYYY-MM-DD')
        Estadia.find({data_entrada : {$gte: data_inicial}, data_saida: {$lt: data_final}}).populate("quarto").populate("hospede").populate("fatura").then((estadias) => {
            res.render("quartos/relatorio-estadia", {estadias: estadias})
        }).catch((err) => {
            req.flash("error_msg", "Erro ao realizar a pesquisa avançada, tente novamente.")
            res.redirect("/usuario/relatorio-estadia")
            console.log(err)
        })
    }

    

    
})

router.get("/listar-faturas", verifica_atendente, (req, res) => {
    Fatura.find({ativa: true}).populate("hospede").then((faturas) => {
        res.render("financeiro/lista-faturas", {faturas: faturas})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar faturas")
        res.redirect("/dashboard")
        console.log(err)
    })
})

router.get("/ver-fatura/:id", verifica_atendente, (req, res) => {
    Fatura.findOne({_id: req.params.id}).then((fatura) => {
        Consulta.find({fatura: fatura._id}).populate("servico").populate("terapeuta").then((consultas) => {
            Hospede.findOne({_id: fatura.hospede}).then((cliente) => {
                Estadia.findOne({hospede: cliente._id, ativa: true}).then((estadia) => {
                    res.render("financeiro/fatura-detalhada", {consultas: consultas, cliente: cliente, fatura: fatura, estadia: estadia})
                }).catch((err) => {
                    req.flash("error_msg", "Erro ao encontrar estadia da fatura.")
                    res.redirect("/dashboard")
                    console.log(err)
                })
                
            }).catch((err) => {
                req.flash("error_msg", "Erro ao econtrar cliente.")
                res.redirect("/dashboard")
                console.log(err)
            })
        }).catch((err) => {
            req.flash("error_msg", "Erro ao encontrar consultas atraledas!")
            res.redirect("/dashboard")
            console.log(err)
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar fatura!")
        res.redirect("/dashboard")
        console.log(err)
    })
})

router.get("/realizar-venda", verifica_atendente, (req, res) => {
    Produto.find().then((produtos) => {
        Hospede.find().then((hospedes) => {
            
        })
    })
})





module.exports = router