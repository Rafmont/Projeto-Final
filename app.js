//Carregando módulos.
    //Carregamento de módulos do Node.JS
    const express = require('express');
    const handlebars = require('express-handlebars');
    const bodyParser = require('body-parser');
    const app = express()
    const path = require("path")
    const mongoose = require("mongoose");
    const session = require("express-session");
    const flash = require("connect-flash");
    const passport = require("passport")
    const moment = require('moment')
    const bcrypt = require("bcryptjs")
    const DateCalculator = require('date-calculator')
    
    //Carregamento dos arquivos de rotas separados.
    const rotas_usuario = require("./routes/usuario")
    const rotas_admin = require("./routes/admin")

    //Carregamento de Helpers para o sistema.
    const {verifica_login} = require("./helpers/verifica_login")

    //Carregamento das models utilizadas.
    require("./models/ContaAcesso")
    require("./models/Evento")
    require("./models/Usuario")

    //Definição das constantes que recebem os models do banco de dados.
    const Usuario = mongoose.model("usuarios")
    const ContaAcesso = mongoose.model("contasacesso")
    const Evento = mongoose.model("eventos")
    
    //Outros
    require("./config/auth")(passport)
    

//Configurações
//Sessão
    app.use(session({
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
    }))

    app.use(passport.initialize())
    app.use(passport.session())

//Flash
    app.use(flash())

//Middleware
    app.use((req,res,next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null;
        next();
    })

//Body Parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())

//handlebars

    app.engine('handlebars', handlebars({defaultLayout: 'main', helpers: {
        //Definição dos Helpers para Handlebars:

        //Helper para apresentação dos dados em formato de SELECT, conforme a opção do banco de dados.
        select: function(value, options) {
            return options.fn(this)
            .split('\n')
            .map(function(v) {
                var t = 'value="' + value + '"'
                return ! RegExp(t).test(v) ? v : v.replace(t, t + ' selected="selected"')
            })
            .join('\n')
        },

        //Helper para formatação da data para o usuiário no formato Brasileiro.
        dateFormat: function(date) {
            return moment(date).format('DD-MM-YYYY')
        },

        //Helper para a formatação da data para o sistema no formato ISO internacional.
        dateFormatiso: function(date) {
            return moment(date).format('YYYY-MM-DD')
        },

        //Helper para melhor uso de condições no sistema, onde é possível comparar dois elementos, ao inves de verificar apenas se é
        //true ou false.
        ifcond: function(v1, operator, v2, options){
            switch (operator) {
                case '==':
                    return (v1 == v2) ? options.fn(this) : options.inverse(this);
                case '===':
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                case '!=':
                    return (v1 != v2) ? options.fn(this) : options.inverse(this);
                case '!==':
                    return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                case '<':
                    return (v1 < v2) ? options.fn(this) : options.inverse(this);
                case '<=':
                    return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                case '>':
                    return (v1 > v2) ? options.fn(this) : options.inverse(this);
                case '>=':
                    return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                case '&&':
                    return (v1 && v2) ? options.fn(this) : options.inverse(this);
                case '||':
                    return (v1 || v2) ? options.fn(this) : options.inverse(this);
                default:
                    return options.inverse(this);
            }
        },

        //Helper para agrupar em determinado número os elementos levados do banco de dados, melhorando a exibição.
        grouped_each: function(every, context, options){
            var out = "", subcontext = [], i;
            if (context && context.length > 0) {
                for (i = 0; i < context.length; i++) {
                    if (i > 0 && i % every === 0) {
                        out += options.fn(subcontext);
                        subcontext = [];
                    }
                    subcontext.push(context[i]);
                }
                out += options.fn(subcontext);
            }
            return out;
        },

        //Helper para verificar se uma determinada data já passou conforme o dia de hoje.
        has_passed: function(dateString, options) {
            if(moment(dateString).isAfter(moment())){
              return options.fn(this);
            } else {
              return options.inverse(this);
            }
        },
    }}))
    app.set('view engine', 'handlebars')
    


//Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect("mongodb://localhost/Terra-Sol", {useNewUrlParser: true }).then(() => {
        console.log("Conectado ao mongo")
    }).catch((err) => {
        console.log("Erro ao conectar: " + err)
    })

//Public
    app.use(express.static(path.join(__dirname, "public")))


//Rotas
    //Rota para renderizar a página inicial do sistema.
    app.get('/', (req, res) => {
        if(req.user) {
            res.redirect("/dashboard")
        } else {
            res.render("index")
        }
    })

    //Rota para renderizar o dashboar após o login.
    app.get('/dashboard', verifica_login, (req, res) => {
        Evento.find().sort({data: "desc"}).then((eventos) => {
            var data_agora = Date(Date.now());
            res.render("dashboard", {eventos: eventos, data_agora: data_agora})
        })
    })

    //Rota para realizar o login.
    app.post('/login', (req, res, next) => {
        passport.authenticate("local", {
            successRedirect: "/dashboard",
            failureRedirect: "/",
            failureFlash: true
        })(req, res, next)
    })

    //Rota para capturar a requisição de logout do sistema.
    app.get("/logout", (req, res) => {
        req.logout()
        req.flash("success_msg", "Deslogado com sucesso!")
        res.redirect("/")
    })

    //Chamada das rotas definidas em outros arquivos.
    app.use('/usuario', rotas_usuario)
    app.use('/admin', rotas_admin)


//Outros
    //Definição da porta e deixando o servidor na espera de novas requisições.
    const PORT = 8081
    app.listen(PORT, () => {
        console.log("Servidor Rodando");
    })
