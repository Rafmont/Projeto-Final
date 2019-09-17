//Carregando módulos.
    //Carregamento de módulos do Node.JS
    const express = require("express")
    const router = express.Router()
    const mongoose = require("mongoose")   
    const bcrypt = require("bcryptjs")
    const passport = require("passport")
    const handlebars = require('express-handlebars');
    const moment = require('moment')
    
    //Carregamento de Helpers para o sistema.
    const {verifica_gerente} = require("../helpers/verifica_gerente")
    const {verifica_atendente} = require("../helpers/verifica_atendente")
    const {verifica_login} = require("../helpers/verifica_login")
    
    //Carregamento das models utilizadas.
    require("../models/Fatura")
    require("../models/ContaAcesso")
    require("../models/Especialidade")
    require("../models/Terapeuta")
    require("../models/Usuario")
    require("../models/Usuario_Desativado")
    require("../models/Evento")
    require("../models/Hospede")

    //Definição das constantes que recebem os models do banco de dados.
    const ContaAcesso = mongoose.model("contasacesso")
    const Fatura = mongoose.model("faturas")
    const Usuario_Desativado = mongoose.model("usuarios_desativados")
    const Usuario = mongoose.model("usuarios")
    const Hospede = mongoose.model("hospedes")
    const Evento = mongoose.model("eventos")
    const Terapeuta = mongoose.model("terapeutas")
    const Especialidade = mongoose.model("especialidades")


//Início da definição de rodas /admin/

//Cabeçalho padrão para definição de uma rota:
/*
    Nome da Rota:
    Tipo de Rota:
    Parâmetro: 
    Função da Rota:
    Autor: Rafael Monteiro
*/


/*
    Nome da Rota: Cadastro de Evento
    Tipo de Rota: GET
    Parâmetro: Nenhum.
    Função da Rota: Capturar a requisição de cadastro de evento e renderizar a view cadastro-evento.
    Autor: Rafael Monteiro
*/
router.get('/cadastro-evento', verifica_gerente, (req,res) => {
    res.render("eventos/cadastro-evento")
})

/*
    Nome da Rota: Cadastro de Evento
    Tipo de Rota: POST
    Parâmetro: Nenhum.
    Função da Rota: Realizar o cadastro de um evento conforme os dados fornecidos por um formulário, salvando assim no banco de dados.
    Autor: Rafael Monteiro
*/
router.post('/cadastro-evento', verifica_gerente, (req,res) => {
    //Inicialização da variável para capturar os erros no formulário.
    var erros = []

    //Sequência de verificações para averiguar a integridade dos dados do formulário.
    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        erros.push({texto: "Titulo inválido."})
    }
    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
        erros.push({texto: "descricao inválida."})
    }
    if(erros.length > 0) {
        res.render("eventos/cadastro-evento", {erros: erros})
    } else {
        //Geração de uma "nova_data", para que seja adequada quando salva ao banco de dados, mudando assim seu padrão.
        var novaData = moment(req.body.data, "YYYY-MM-DD")

        //Verificação da data de término, caso exista, é realizada a mesma função da "nova_data", para data de término.
        if(req.body.data_termino) {
            var novaData_termino = moment(req.body.data_termino, "YYYY-MM-DD")
            //Necessidade de criar uma data "temporária" de um dia a frente, por conta da exibição no Full Calendar.
            var data_termino_fc = moment(req.body.data_termino, "YYYY-MM-DD").add(1, 'days')
        }else {
            var novaData_termino = null
        }

        //Verificação sobre o horário de término, caso exista, é atribuido, caso contrário definido como nulo.
        if(req.body.horario_termino) {
            var horario_termino = req.body.horario_termino
        } else {
            var horario_termino = null
        }
        
        //Criação da constante que armazenará o novo evento, conforme os dados passados pelos formulários e alguns que já foram 
        //tratados nesta rota.
        const novoEvento = new Evento({
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            horario: req.body.horario,
            horario_termino: horario_termino,
            data: novaData,
            data_termino: novaData_termino,
            data_termino_fc: data_termino_fc,
        })

        //Salvando o novo evento e redirecionando em caso de sucesso, capturando o erro em caso de falha.
        novoEvento.save().then(() => {
            req.flash("success_msg", "Evento criado com sucesso!")
            res.redirect("/dashboard")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao criar o evento.")
            res.redirect("/dashboard")
        })
    }
})

/*
    Nome da Rota: Alterar evento
    Tipo de Rota: GET
    Parâmetro: id (Referênte ao evento que foi clicado na view anterior).
    Função da Rota: Buscar um determinado evento, conforme a view anterior, e renderizar a view alterar-evento, onde se encontra o formulário para alterar evento.
    Autor: Rafael Monteiro
*/
router.get("/alterar-evento/:id", verifica_gerente, (req, res) => {
    //Função para buscar apenas um evento, que possua um ID iqual ao recebido por parâmetro.
    Evento.findOne({_id: req.params.id}).then((evento) => {
        //Renderização da view, passando o evento encontrado para ser exibido e alterado.
        res.render("eventos/alterar-evento", {evento: evento})
    }).catch((err) => {
        //Tratamento de erros.
        req.flash("error_msg", "Erro ao encontrar evento")
        res.redirect("/dashboard")
    })
})

/*
    Nome da Rota: Alterar evento
    Tipo de Rota: POST 
    Parâmetro: Nenhum
    Função da Rota: Alterar efetivamente um evento, salvando os novos dados no banco de dados, conforme os dados passados por um formulario.
    Autor: Rafael Monteiro
*/
router.post("/alterar-evento", verifica_gerente, (req, res) => {
    //Busca de um evento cujo corresponde ao ID presente no formulário.
    Evento.findOne({_id: req.body.id}).then((evento) => {
        //Criação de uma nova data para se adequar ao formato salvo no banco de dados.
        var novaData = moment(req.body.data, "YYYY-MM-DD")
        //Verificação de uma data término.
        if(req.body.data_termino) {
            //Alteração das datas para que as mesmas sejam salvas corretamente no banco, criação de uma data com incremento de um dia
            //para melhor exibição do Full Calendar.
            var novaData_termino = moment(req.body.data_termino, "YYYY-MM-DD")
            var data_termino_fc = moment(req.body.data_termino, "YYYY-MM-DD").add(1, 'days')
        }else {
            var novaData_termino = null
            var data_termino_fc = null
        }

        //Verificação da existência de um horário de término do evento.
        if(req.body.horario_termino) {
            var horario_termino = req.body.horario_termino
        } else {
            var horario_termino = null
        }

        //Atualização dos dados do evento, sobrescrevendo os dados presentes no banco com os recebidos pelo formulário.
        evento.titulo = req.body.titulo
        evento.descricao = req.body.descricao
        evento.horario = req.body.horario
        evento.horario_termino = horario_termino
        evento.data = novaData
        evento.data_termino = novaData_termino
        evento.data_termino_fc = data_termino_fc

        //Salvamento do evento, na sequência redirecionamento em caso de sucesso e tratamento de erros caso falhe.
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

/*
    Nome da Rota: Desativar evento
    Tipo de Rota: GET
    Parâmetro: id (Referente a um evento clicado na view anterior).
    Função da Rota: Buscar um evento correspondente ao id e renderizar a view desativar-evento passando o evento encontrado.
    Autor: Rafael Monteiro
*/
router.get("/desativar-evento/:id", verifica_gerente, (req, res) => {
    //Busca por um evento que tenha o mesmo ID do parâmetro.
    Evento.findOne({_id: req.params.id}).then((evento) => {
        //Renderização da view passando o evento para ser apresentado antes da desativação. 
        res.render("eventos/desativar-evento", {evento: evento})
    }).catch((err) => {
        //Tratamento de erros.
        req.flash("error_msg", "Erro ao encontrar postagem.")
        req.render("dashboard")
    })
})

/*
    Nome da Rota: Desativar evento
    Tipo de Rota: POST
    Parâmetro: Nenhum.
    Função da Rota: Desativar o evento que foi confirmado na view anterior.
    Autor: Rafael Monteiro
*/
router.post("/desativar-evento", verifica_gerente, (req, res) => {
    //Busca do evento pelo ID presente no formulário.
    Evento.findOne({_id: req.body.id}).then((evento) => {
        //Alteração da propriedade do evento de acontecer para "false", dessa forma os métodos de busca não o encontram.
        evento.acontecer = false
        //Salvamento do evento, redirecionamento caso sucesso, tratamento de erro caso falha.
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

/*
    Nome da Rota: Ver evento.
    Tipo de Rota: GET
    Parâmetro: id (ID do evento clicado na view anterior)
    Função da Rota: Buscar o evento correspondente ao id e renderizar a view ver-evento, exibindo os dados do evento.
    Autor: Rafael Monteiro
*/
router.get("/ver-evento/:id", verifica_login, (req, res) => {
    //Busca de um evento com id igual ao fornecido pelo parâmetro, renderizando a view em caso de sucesso e tratando erros em caso
    //de falha.
    Evento.findOne({_id: req.params.id}).then((evento) => {
        res.render("eventos/ver-evento", {evento: evento})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar o evento.")
        res.redirect("/dashboard")
    })
})


/*
    Nome da Rota: Desativar especialidade
    Tipo de Rota: GET
    Parâmetro: id (Referente a especialidade clicada na view anterior).
    Função da Rota: Buscar uma especialidade para que seja apresentada e desativada.
    Autor: Rafael Monteiro
*/
router.get("/desativar-especialidade/:id", verifica_gerente, (req, res) => {
    //Busca de uma especialiade com o mesmo id fornecido por parâmetro. Em caso de sucesso, rederização da view desativar-especialidade
    //em caso de falha, tratamento de erros.
    Especialidade.findOne({_id: req.params.id}).then((especialidade) => {
        res.render("terapeutas/desativar-especialidade", {especialidade: especialidade})
    }).catch((err) => {
        req.flash("error_msg", "Falha ao encontrar especialidade")
        res.redirect("/admin/especialidades")
    })
})

/*
    Nome da Rota: Desativar especialidade
    Tipo de Rota: POST
    Parâmetro: Nenhum.
    Função da Rota: Alterar o parâmetro ativa da especialidade para false, para desta forma desativa-la.
    Autor: Rafael Monteiro
*/
router.post("/desativar-especialidade", verifica_gerente, (req, res) => {
    //Busca da especialidade, onde o ID é igual ao fornecido pelo parâmetro.
    Especialidade.findOne({_id: req.body.id_especialidade}).then((especialidade) => {
        //Alteração do estado da propriedade "ativa" da especialdade para false, dessa forma os métodos de busca não a encontram.
        especialidade.ativa = false,
        //Salvamento da especialdiade, redirecionamento em caso de sucesso e tratamento de erros em caso de falha.
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

router.get("/desativar-terapeuta/:id", verifica_gerente, (req, res) => {
    Terapeuta.findOne({_id: req.params.id, ativo: true}).populate("especialidade").then((terapeuta) => {
        if(terapeuta) {
            res.render("terapeutas/desativar-terapeuta", {terapeuta: terapeuta})
        } else {
            req.flash("error_msg", "Erro ao encontrar terapêuta")
            res.redirect("/admin/desativar-terapeuta")
        }   
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar terapeuta!")
        res.redirect("/dashboard")
        console.log(err)
    })
})


router.post("/desativar-terapeuta", verifica_gerente, (req, res) => {
    Terapeuta.findOne({_id: req.body._id}).then((terapeuta) => {
        terapeuta.ativo = false
        terapeuta.save().then(() => {
            req.flash("success_msg", "Terapêuta desativado com sucesso!")
            res.redirect("/dashboard")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao desativar terapêuta!")
            res.redirect("/dashboard")
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar terapêuta!")
        res.redirect("/dashboard")
    })
})


//rotas para desativar o funcionário:
router.get("/desativar-funcionario/:id",verifica_gerente, (req, res) => {
    Usuario.findOne({_id: req.params.id}).then((funcionario) => {
        if(funcionario) {
            res.render("funcionarios/desativar-funcionario", {funcionario: funcionario})
        }else {
            req.flash("error_msg", "Não encontramos um funcionario com este CPF.")
            res.redirect("alterar-funcionario")
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao encontrar o funcionario.")
        console.log(err)
    })
})

router.post("/desativar-funcionario", verifica_gerente, (req, res) => {
    Usuario.findOne({_id: req.body.id}).then((funcionario) => {
        funcionario.ativo = false
        funcionario.save().then(() => {
            ContaAcesso.deleteOne({usuario: req.body.id}).then(() => {
                req.flash("success_msg", "Funcionário desativado com sucesso!")
                res.redirect("/usuario/gerenciar-funcionarios")
            }).catch((err) => {
                req.flash("error_msg", "Erro ao desativar conta de acesso!")
                res.redirect("/usuario/gerenciar-funcionarios")
                console.log(err)
            })
        }).catch((err) => {
            req.flash("error_msg", "Erro ao desativar funcionário!")
            res.redirect("/usuario/gerenciar-funcionarios")
            console.log(err)
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar funcionário!")
        res.redirect("/usuario/gerenciar-funcionarios")
        console.log(err)
    })
})


module.exports = router