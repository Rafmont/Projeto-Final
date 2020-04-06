//Carregando módulos
    //Carregando módulos do Node.js
    const express = require("express")
    const router = express.Router()
    const mongoose = require("mongoose")
    const bcrypt = require("bcryptjs")
    const passport = require("passport")
    const handlebars = require('express-handlebars');
    const moment = require('moment')
    const PDFDocument = require('pdfkit');
    var fs  = require('fs');

    //Carregamento dos Helpers para o sistema.
    const {verifica_gerente} = require("../helpers/verifica_gerente")
    const {verifica_atendente} = require("../helpers/verifica_atendente")
    const {verifica_login} = require("../helpers/verifica_login")
    const {verifica_clinico} = require("../helpers/verifica_clinico")

    //Carregamento das Models utilizadas
    require("../models/Usuario")
    require("../models/Usuario_Desativado")
    require("../models/Evento")
    require("../models/Servico")
    require("../models/Hospede")
    require("../models/Fatura")
    require("../models/Consulta")
    require("../models/Produto")
    require("../models/Quarto")
    require("../models/Estadia")
    require("../models/ContaAcesso")
    require("../models/Terapeuta")
    require("../models/Fatura-Consulta")
    require("../models/FaturaProduto")
    require("../models/Especialidade")

    //Definição das constantes para as models do banco de dados.
    const Usuario = mongoose.model("usuarios")
    const Evento = mongoose.model("eventos")
    const Servico = mongoose.model("servicos")
    const Hospede = mongoose.model("hospedes")
    const Fatura = mongoose.model("faturas")
    const Consulta = mongoose.model("consultas")
    const Produto = mongoose.model("produtos")
    const Quarto = mongoose.model("quartos")
    const Estadia = mongoose.model("estadias")
    const ContaAcesso = mongoose.model("contasacesso")
    const Terapeuta = mongoose.model("terapeutas")
    const FaturaConsulta = mongoose.model("faturasconsultas")
    const FaturaProduto = mongoose.model("faturaprodutos")
    const Especialidade = mongoose.model("especialidades")
    const Usuario_Desativado = mongoose.model("usuarios_desativados")




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
                res.redirect("/usuario/cadastro-funcionario")
                console.log(err)
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

router.get("/editar-funcionario/:id", verifica_gerente, (req, res) => {
    Usuario.findOne({_id: req.params.id}).then((usuario) => {
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

router.get("/ver-funcionario/:id", verifica_atendente, (req, res) => {
    Usuario.findOne({_id: req.params.id}).then((funcionario) => {
        res.render("funcionarios/ver-funcionario", {funcionario: funcionario})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar funcionário!")
        res.redirect("/usuario/gerenciar-funcionarios")
        console.log(err)
    })
})

/*
    Nome da Rota: Serviços 
    Tipo de Rota: GET
    Parâmetro: Nenhum.
    Função da Rota: Recuperar todos os serviços e renderizar a view servicos
    Autor: Rafael Monteiro
*/
router.get("/servicos", verifica_atendente, (req, res) => {
    Servico.find({ativo: true}).sort({nome: 1}).then((servicos) => {
        res.render("clinicos/servicos", {servicos: servicos})
    }).catch((err) => {
        req.flash("error_msg", "Não foi possível buscar os serviços.")
        res.redirect("/usuarios/servicos")
    })
})

/*
    Nome da Rota: Cadastro de Serviço
    Tipo de Rota: get  
    Parâmetro: Nenhum.
    Função da Rota: Renderizar a view "cadastro-servico" referente ao formulário de cadastro de serviços.
    Autor: Rafael Monteiro
*/
router.get("/cadastro-servico", verifica_atendente, (req, res) => {
    res.render("clinicos/cadastro-servico")
})


/*
    Nome da Rota: Cadastro de Serviço
    Tipo de Rota: POST
    Parâmetro: Nenhum.
    Função da Rota: Recuperar os dados que foram enviados pelo formulário e criar um novo documento no banco de dados
        referente a um novo serviço.
    Autor: Rafael Monteiro
*/
router.post("/cadastro-servico", verifica_atendente, (req, res) => {

    const novoServico = new Servico({
        nome: req.body.titulo,
        descricao: req.body.descricao,
        valor: req.body.valor,
        duracao: req.body.duracao
    }) 
    novoServico.save().then(() => {
        req.flash("success_msg", "Serviço cadastrado com sucesso!")
        res.redirect("/usuario/servicos")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao cadastrar o serviço.")
        res.redirect("/usuario/cadastro-servico")
    })

})

/*
    Nome da Rota: Desativar Serviço
    Tipo de Rota: GET
    Parâmetro: id (Referênte ao serviço clicado na interface anterior)
    Função da Rota: Buscar um evento que corresponde ao id recebido por parâmetro e renderizar a view desativar-servico.
    Autor: Rafael Monteiro
*/
router.get("/desativar-servico/:id", verifica_atendente, (req, res) => {
    Servico.findOne({_id: req.params.id}).then((servico) => {
        res.render("clinicos/desativar-servico", {servico: servico})
    }).catch((err) => {
        req.flash("seccess_msg", "Falha ao encontrar serviço")
        res.redirect("/usuario/servicos")
    })
})

/*
    Nome da Rota: Desativar Serviço
    Tipo de Rota: POST
    Parâmetro: Nenhum.
    Função da Rota: Resgatar a confirmação de desativação do serviço e alterar sua propriedade "ativo" para "false".
    Autor: Rafael Monteiro
*/
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

/*
    Nome da Rota: Alterar Serviço  
    Tipo de Rota: GET
    Parâmetro: id (Referênte ao serviço clicado na página anterior)
    Função da Rota: Buscar um serviço com ID correspondente ao parâmetro e renderizar a view alterar-servico
    Autor: Rafael Monteiro
*/
router.get("/alterar-servico/:id", verifica_atendente, (req, res) => {
    Servico.findOne({_id: req.params.id}).then((servico) => {
        res.render("clinicos/alterar-servico", {servico:servico})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar servico.")
        res.redirect("/usuario/servicos")
    })
})

/*
    Nome da Rota: Alterar Servico
    Tipo de Rota: POST 
    Parâmetro: Nenhum.
    Função da Rota: Alterar o documento de um serviço com base nos dados passados pelo formulário.
    Autor: Rafael Monteiro
*/
router.post("/alterar-servico", verifica_atendente, (req, res) => {
    Servico.findOne({_id: req.body.id}).then((servico) => {
        servico.nome = req.body.titulo
        servico.descricao = req.body.descricao
        servico.valor = req.body.valor
        servico.duracao = req.body.duracao
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

/*
    Nome da Rota: Ver Serviço
    Tipo de Rota: GET
    Parâmetro: id (Referênte ao serviço clicado na página anterior)
    Função da Rota: Recuperar um serviço com ID referênte ao parâmetro e renderizar a view
    Autor: Rafael Monteiro
*/
router.get("/ver-servico/:id", verifica_atendente, (req, res) => {
    Servico.findOne({_id: req.params.id, ativo: true}).then((servico) => {
        res.render("clinicos/ver-servico", {servico: servico})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar serviço!")
        res.redirect("/usuario/servicos")
        console.log(err)
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

router.get("/ver-hospedes/:id", verifica_atendente, (req, res) => {
    Hospede.findOne({_id: req.params.id}).then((hospede) => {
        res.render("hospedes/ver-hospedes", {hospede: hospede})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar hóspede!")
        res.redirect("/usuario/gerenciar-hospedes")
        console.log(err)
    })
})

router.get("/alterar-hospedes/:id", verifica_atendente, (req, res) => {
    Hospede.findOne({_id: req.params.id}).then((hospede) => {
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

router.get("/desativar-hospedes/:id", verifica_atendente, (req, res) => {
    Hospede.findOne({_id: req.params.id}).then((hospede) => {
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

/*
    Nome da Rota: Agendar Serviço
    Tipo de Rota: GET
    Parâmetro: Nenhum.
    Função da Rota: Renderizar uma view para selecionar a especialidade.
    Autor: Rafael Monteiro
*/
router.get("/agendar-servico", verifica_atendente, (req, res) => {
    //Busca todas as especialidades no banco para enviar para a view, caso de falha trata os erros com catch.
    Especialidade.find().then((especialidades) => {
        //Renderiza a view para quem requisitou na rota.
        res.render("terapeutas/marcar-atendimento", {especialidades, especialidades})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar especialidades!")
        res.redirect("/dashboard")
        console.log(err)
    })
})

/*
    Nome da Rota: Agendar Serviço - Buscar Data
    Tipo de Rota: GET
    Parâmetro: Id (Referente a especialidade escolhida).
    Função da Rota: Apresentar uma interface de busca de dia para verificar os serviços agendados.
    Autor: Rafael Monteiro
*/
router.get("/agendar-servico-buscar-data/:id", verifica_atendente, (req, res) => {
    //Renderiza a view passando como parâmetro o ID das especilidades para que o mesmo não seja perdido.
    res.render("terapeutas/agendar-servico-buscar-data", {especialidade: req.params.id})
})

/*
    Nome da Rota: Agendar Serviço - buscar data.
    Tipo de Rota: POST
    Parâmetro: Id (Referente a especialidade escolhida).
    Função da Rota: Apresentar uma interface de busca de dia para verificar os serviços agendados.
    Autor: Rafael Monteiro
*/
router.post("/agendar-servico-ver-data", verifica_atendente, (req, res) => {
    //Recupera os dados do formulário e atribui em variáveis para uso posterior.
    var id_especilidade = req.body.id_especialidade
    var data_escolhida = moment(req.body.data)
    data_escolhida.toISOString()

    //Faz busca dos terapêutas com a determinada especilidade passada por ID.
    Terapeuta.find({especialidade: id_especilidade}).then((terapeutas) => {
        var id_terapeutas = []
        for(i = 0; i < terapeutas.length; i++) {
            id_terapeutas[i] = terapeutas[i]._id;
        }

        //Busca consultas dentre os terapêutas buscados e no dia selecionado.
        Consulta.find({data_consulta: data_escolhida
        }).where('terapeuta').in(id_terapeutas).populate("terapeuta").populate("servico").then((consultas) => {
            res.render("terapeutas/agendar-servico-buscar-data", {consultas: consultas, terapeutas: terapeutas, data: data_escolhida})
        }).catch((err) => {
            req.flash("error_msg", "Erro ao buscar Consultas no banco de dados.")
            res.redirect("/usuario/agendar-servico")
        })

    }).catch((err) => {
        req.flash("error_msg", "Erro ao buscar terapêutas no banco de dados.")
        res.redirect("/usuario/agendar-servico")
    })

})

/*
    Nome da Rota: Agendar Serviço - apresentar formulário de agendamento.
    Tipo de Rota: POST
    Parâmetro: Nenhum.
    Função da Rota: Apresentar o formulário de agendamento passando as informações coerentes.
    Autor: Rafael Monteiro
*/
router.post("/agendar-servico-mostrar-form", verifica_atendente, (req, res) => {
    var id_terap = req.body.enviar_terapeuta;
    var horar = req.body.enviar_horario;
    console.log(id_terap + " " + horar)
    Servico.find({ativo: true}).then((servicos) => {
        Terapeuta.findOne({_id: req.body.enviar_terapeuta}).then((terapeuta) => {
            Hospede.find().then((hospedes) => {
                res.render("clinicos/agendar-atendimento", {servicos: servicos, terapeuta: terapeuta, hospedes: hospedes, horario: req.body.enviar_horario, data: req.body.enviar_data})
            }).catch((err) => {
                req.flash("error_msg", "Erro ao buscar hospedes")
                res.redirect("/usuario/agendar-servico")
            })
        }).catch((err) => {
            req.flash("error_msg", "Erro ao buscar terapeuta!")
            res.redirect("/usuario/agendar-servico")
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao buscar serviços.")
        res.redirect("/usuario/agendar-servico")
    })
})

/*
    Nome da Rota: Agendar Serviço
    Tipo de Rota: POST
    Parâmetro: Nenhum.
    Função da Rota: Salvar no banco de dados um novo serviço especializado, tratando os erros.
    Autor: Rafael Monteiro
*/
router.post("/agendar-servico-esp", verifica_atendente, (req, res) => {
    
})

/*
    Nome da Rota: Marcar atendimento - Escolher o terapêuta
    Tipo de Rota: GET
    Parâmetro: id (referente a especialidade definida anteriormente).
    Função da Rota: Buscar todo os terapêutas que sejam compatíveis com uma especialidade.
    Autor: Rafael Monteiro
*/
router.get("/marcar-atendimento-escolher-terapeuta/:id", verifica_atendente, (req, res) => {
    //Busca por terapêutas que possuem a especialidade igual ao id passado por parâmetro. Caso de falha trata o erro.
    Terapeuta.find({especialidade: req.params.id}).then((terapeutas) => {
        //Passo adicional no tratamento de erros onde verifica se existe algum terapêuta com determinada especialidade.
        //Caso não exista redireciona para selecionar especialidade.
        if (terapeutas != []) {
            res.render("terapeutas/marcar-atendimento-escolher-terapeuta", {terapeutas: terapeutas})
        } else {
            req.flash("error_msg", "Não existem terapêutas com esta especialidade!")
            res.redirect("/usuario/marcar-atendimento")
        }
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar terapêutas com determinada especialidade!")
        res.redirect("/usuario/marcar-atendimento")
    })
})

/*
    Nome da Rota: Marcar atendimento - Escolher data
    Tipo de Rota: GET
    Parâmetro: id (referente ao terapeuta definido anteriormente).
    Função da Rota: Buscar a agenda do terapeuta solicitado.
    Autor: Rafael Monteiro
*/
router.get("/marcar-atendimento-escolher-data/:id", verifica_atendente, (req, res) => {
    //Busca por consultas ligadas ao ID do terapêuta.
    Consulta.find({terapeuta: req.params.id}).populate("cliente").then((consultas) => {
        res.render("terapeutas/marcar-atendimento-confimar-dados", {consultas: consultas})
    }).catch((err) => {
        req.flash("Não foi possível encontrar as consultas.")
        res.redirect("/usuario/marcar-atendimento")
    })
})

/*
    Nome da Rota: Agendar Atendimento.
    Tipo de Rota: GET
    Parâmetro: Nenhum.
    Função da Rota: Recuperar os dados de Serviços, terapeutas e hóspedes, para serem
    //renderizadaos na view agendar-atendimento.
    Autor: Rafael Monteiro
*/
router.get("/agendar-atendimento", verifica_atendente, (req, res) => {
    Servico.find({ativo: true}).then((servicos) => { 
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
                        var novaData = moment(req.body.data_consulta, "YYYY-MM-DD")
                        const novaConsulta = new Consulta({
                            terapeuta: terapeuta._id,
                            cliente: hospede._id,
                            servico: req.body.servico,
                            sala: req.body.sala,
                            data_consulta: novaData,
                            horario: req.body.horario,
                            valor_consulta: req.body.valor_consulta,
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
                            var novaData = moment(req.body.data_consulta, "YYYY-MM-DD")
                            const novaConsulta = new Consulta({
                                terapeuta: terapeuta._id,
                                cliente: hospede._id,
                                servico: req.body.servico,
                                sala: req.body.sala,
                                data_consulta: novaData,
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
    Consulta.find({terapeuta: req.params.id}).populate("cliente").then((consultas) => {
        res.render("clinicos/atendimentos-marcados", {consultas: consultas})
    }).catch((err) => {
        req.flash("Não foi possível encontrar as consultas.")
        res.redirect("/dashboard")
    })
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

/*
    Nome da Rota: Ver quarto
    Tipo de Rota: GET
    Parâmetro: id (Referênte ao quarto, selecionado na interface de check-in check-out)
    Função da Rota: Buscar um quarto correspondente ao ID do parâmetro e renderizar a view ver-quarto
    Autor: Rafael Monteiro
*/
router.get("/ver-quarto/:id", verifica_atendente, (req, res) => {
    //Busca do quarto referênte ao ID, caso de sucesso renderiza a view ver-quarto enviando o quarto encontrado.
    //Em caso de falha, tratamento de erros e redirecionamento.
    Quarto.findOne({_id: req.params.id}).then((quarto) => {
        res.render("quartos/ver-quarto", {quarto: quarto})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar quarto!")
        res.redirect("/usuario/quartos")
        console.log(err)
    })
})

/*
    Nome da Rota: Agenda quarto
    Tipo de Rota: GET
    Parâmetro: id (Referênte ao quarto, selecionado na interface de check-in check-out)
    Função da Rota: Buscar por estadias correspondentes ao ID do parâmetro do quarto e renderizar a view agenda-quarto
    Autor: Rafael Monteiro
*/
router.get("/agenda-quarto/:id", verifica_atendente, (req, res) => {
    //Busca por estadias que possuem o quarto requisitado e que ao mesmo tempo esteja ativa.
    //Em caso de sucesso, renderiza a view agenda-quarto, mostrando a agenda compelta com todas as estadias deste quarto.
    //Em caso de falha, retorna a interface de quartos e trata os erros.
    Estadia.find({quarto: req.params.id, ativa: true}).populate("hospede").then((estadias) => {
        //Captura o id do quarto para utilizar o botão nova estadia no calendário de agendamento.
        id_quarto = req.params.id
        res.render("quartos/agenda-quarto", {estadias: estadias, id_quarto: id_quarto})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar estadias")
        res.redirect("/usuario/quartos")
        console.log(err)
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
 /*
    Nome da Rota: Listar Faturas
    Tipo de Rota: GET
    Parâmetro: Nenhum. 
    Função da Rota: Buscar todas as faturas em aberto e apresenta-las na tela.
    Autor: Rafael Monteiro
*/
router.get("/listar-faturas", verifica_atendente, (req, res) => {
    Fatura.find({ativa: true}).populate("hospede").then((faturas) => {
        res.render("financeiro/lista-faturas", {faturas: faturas})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar faturas")
        res.redirect("/dashboard")
        console.log(err)
    })
})

/*
    Nome da Rota: Ver Fatura
    Tipo de Rota: GET
    Parâmetro: id (referênte a fatura clicada na interface anterior.)
    Função da Rota:
    Autor: Rafael Monteiro
*/
router.get("/ver-fatura/:id", verifica_atendente, (req, res) => {
    Fatura.findOne({_id: req.params.id}).then((fatura) => {
        Consulta.find({fatura: fatura._id}).populate("servico").populate("terapeuta").then((consultas) => {
            Hospede.findOne({_id: fatura.hospede}).then((cliente) => {
                Estadia.find({hospede: cliente._id, ativa: true}).then((estadias) => {
                    res.render("financeiro/fatura-detalhada", {consultas: consultas, cliente: cliente, fatura: fatura, estadias: estadias})
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


//Rotas para o terapêuta visualizar seu atendimento
router.get("/ver-atendimento/:id", verifica_clinico, (req, res) => {
    Consulta.findOne({_id: req.params.id}).populate("terapeuta").populate("cliente").populate("servico").then((consulta) => {
        res.render("terapeutas/ver-atendimento", {consulta: consulta})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar consulta!")
        res.redirect("/dashboard")
        console.log(err)
    })
})

//Rotas para renderizar a lista de terapêutas e gerenciá-los
router.get("/gerenciar-terapeuta", verifica_clinico, (req, res) => {
    Terapeuta.find().sort({nome: 1}).populate("especialidade").then((terapeutas) => {
        res.render("terapeutas/gerenciar-terapeutas", {terapeutas: terapeutas})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar terapêutas!")
        res.redirect("/dashboard")
        console.log(err)
    })
})


//Rotas para manipular terapeutas.
router.get("/ver-terapeuta/:id", verifica_gerente, (req, res) => {
    Terapeuta.findOne({_id: req.params.id}).populate("especialidade").then((terapeuta) => {
        res.render("terapeutas/ver-terapeuta", {terapeuta: terapeuta})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar terapeuta!")
        res.redirect("/usuario/gerenciar-terapeuta")
        console.log(err)
    })
})

router.get("/editar-terapeuta/:id", verifica_gerente, (req, res) => {
    Terapeuta.findOne({_id: req.params.id}).populate("especialidade").then((terapeuta) => {
        if(terapeuta) {
            Terapeuta.find().then((terapeutas) => {
                Especialidade.find().then((especialidades) => {
                    res.render("terapeutas/alterar-terapeuta", {terapeuta: terapeuta, terapeutas: terapeutas, especialidades: especialidades})
                }).catch((err) => {
                    req.flash("error_msg", "Erro ao encontrar especialidade")
                    res.redirect("/dashboard")
                })
            }).catch((err) => {
                req.flash("error_msg", "Erro ao encontrar terapêuta!")
                res.redirect("/dashboard")
                console.log(err)
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

//Rotas para gerenciamento de funcionários.
router.get("/gerenciar-funcionarios", verifica_gerente, (req, res) => {
    Usuario.find({ativo: true}).sort({nome: 1}).then((funcionarios) => {
        res.render("funcionarios/gerenciar-funcionarios", {funcionarios: funcionarios})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar funcionários!")
        res.redirect("/dashboard")
        console.log(err)
    })
})


router.get("/especialidades", verifica_atendente, (req, res) => {
    Especialidade.find({ativa: true}).sort({nome: 1}).then((especialidades) => {
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
        res.redirect("/usuario/especialidades")
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
        res.redirect("/usuario/especialidades")
    })
})

router.post("/alterar-especialidade", verifica_gerente, (req, res) => {
    Especialidade.findOne({_id: req.body.id_especialidade}).then((especialidade) => {
        especialidade.nome = req.body.nome,
        especialidade.descricao = req.body.descricao,
        especialidade.save().then(() => {
            req.flash("success_msg", "Especialidade alterada com sucesso!")
            res.redirect("/usuario/especialidades")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar a especialidade")
            res.redirect("/usuario/especialidades")
        })
    })
})

router.get("/ver-especialidade/:id", verifica_atendente, (req, res) => {
    Especialidade.findOne({_id: req.params.id}).then((especialidade) => {
        res.render("terapeutas/ver-especialidade", {especialidade: especialidade})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontar especialidade!")
        res.redirect("/usuario/especialidades")
        console.log(err)
    })
})

//Rotas para gerenciamento de hóspedes.
router.get("/gerenciar-hospedes", verifica_atendente, (req, res) => {
    Hospede.find({ativo: true}).then((hospedes) => {
        res.render("hospedes/gerenciar-hospedes", {hospedes: hospedes})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar os hóspedes!")
        res.redirect("/dashboard")
        console.log(err)
    })
})

/*
    Nome da Rota: Ver estadia
    Tipo de Rota: GET
    Parâmetro: id (Referênte a estadia marcada)
    Função da Rota: Apresentar uma estadia definida.
    Autor: Rafael Monteiro
*/
router.get("/ver-estadia/:id", verifica_atendente, (req, res) => {
    //Busca de um atendimento com pelo ID que foi enviado.
    //Renderização da view em caso de sucesso. Tratamento de erros em caso de falha.
    Estadia.findOne({_id: req.params.id}).populate("hospede").then((estadia) => {
        res.render("quartos/ver-estadia", {estadia: estadia})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar estadia!")
        res.redirect("/usuario/quartos")
        console.log(err)
    })
})

/*
    Nome da Rota: Check-in Check-out
    Tipo de Rota: GET
    Parâmetro: Nenhum.
    Função da Rota: Apresentar Caléndario de estadias e quartos que estão disponíveis no momento.
    Autor: Rafael Monteiro
*/
router.get("/checkin-checkout", verifica_atendente, (req, res) => {
    //Busca por todos os quartos para que sejam exibidos, em caso de falha, tratamento de erros.
    Quarto.find().then((quartos) => {
        //Busca de todas estadias para que sejam exibidas no calendario.
        //Em caso de falha, tratamento de erros.
        Estadia.find().populate('quarto').then((estadias) => {
            res.render("quartos/checkin-checkout", {quartos: quartos, estadias: estadias})
        }).catch((err) => {
            req.flash("error_msg", "Erro ao encontrar estadias!")
            res.redirect("/dashboard")
            console.log(err)
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar quarto!")
        res.rendirect("/dashboard")
        console.log(err)
    })
})

module.exports = router