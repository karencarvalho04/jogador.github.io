const mysql = require('mysql2')
const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')

const app = express()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb)  {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({storage: storage});

app.use('/uploads', express.static('uploads'))

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'cadastro_players'
});

connection.connect(function(err){
    if(err){
        console.error('Erro: ',err)
        return
    }
    console.log("Conexão estabelecida com sucesso!")
});

app.get("/", function(req, res){
    res.send(`
    <html>
    <head>
        <title> Cadastro </title>
    </head>
    <body>

    <style>

     body {
        font-family: 'Arial', sans-serif;
        background-color: #171a21;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        text-align: center;
    }
    
    
    .field {
        margin-top: 20px;
    }
    

    
    
    a {
        display: flex;
        flex-direction: row;
        padding: 15px 30px;
        margin: 10px;
        text-decoration: none;
        color: #fff;
        background-color: #ff4545;
        border: 1px solid #e63e3e;
        border-radius: 5px;
        transition: background-color 0.3s ease;
        height: 1rem;
        width: 7rem;
        align-items: center;
        justify-content: center;

    }
    
    a:hover {
        background-color: #e63e3e;
    }

    .box{
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    

    </style>
       
    <div class="container">
        

            <div class= "field">
                    <h1>Cadastro</h1>

                    <div class = "box">

                        <p><a href="http://localhost:8081/formulario"> Cadastre Sua Conta</a href></p>
                        <p><a href="http://localhost:8081/listar"> Ver Perfil</a href></p>  

                    </div> 
            </div>
    </div>

    </body>
    </html>
    `)
});

app.get("/formulario", function(req, res){
    res.sendFile(__dirname + "/formulario.html")
});

app.post('/adicionar', upload.single('imagemPath'),(req, res) =>{

   if(!req.file){
        console.log('Nenhum arquivo selecionado!');
        res.status(400).send("Nenhum arquivo selecionado!");
        return;
    }
  
    
    const imagemPath = req.file.filename;
    const usuario = req.body.usuario;
    const nickname = req.body.nickname;
    const senha = req.body.senha
    const senhaV = req.body.senhaV
    const resumo = req.body.resumo;
    const cidade = req.body.cidade;
    const estado = req.body.estado;
    const pais = req.body.pais;
    

    const values = [imagemPath, usuario, nickname, senha,senhaV, resumo, cidade, estado, pais]
    const insert = "INSERT INTO perfil(imagemPath, usuario, nickname, senha, senhaV, resumo, cidade, estado, pais) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"

    connection.query(insert, values, function(err, result){
        if (!err){
        
            console.log("Dados inseridos com sucesso!");
            res.redirect('/listar');
            
        } else {
            console.log("Não foi possível inserir os dados: ", err);
            res.send("Erro!")
        }
    })

   
});
app.get('/listar', function(req, res){

    
    const selectAll = "SELECT * FROM perfil;";
    connection.query(selectAll, function(err, rows){
        if (!err){
            console.log("Dados inseridos com sucesso!")
            res.send(`
            <html>
                <head>
                    <title> Ver Perfil </title>
                    <link rel="stylesheet" type="text/css" href="/estilo.css">
                    <br>
                    

                    <style>
                                body {
                                    background-color: #171a21;
                                    color: #fff;
                                    font-family: Arial, sans-serif;
                                }

                                h1 {
                                    color: #ff4545;
                                    text-align: center;
                                }
                                
                                .header {
                                    text-align: center;
                                    margin: 20px auto;
                                    max-width: 600px;
                                    padding: 20px;
                                    background-color: #1e2128;
                                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                                }

                                img {
                                    display: block;
                                    margin: 0 auto;
                                    width: 200px;
                                    height: 200px;
                                    border-radius: 50%;
                                }

                                h2, h3 {
                                    color: #ff4545;
                                }

                                p {
                                    color: #fff;
                                }

                                .about{
                                    text-align: center;
                                    margin: 20px auto;
                                    max-width: 600px;
                                    padding: 20px;
                                    background-color: #1e2128;
                                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                                }

                                a {
                                    display: inline-block;
                                    padding: 10px 20px;
                                    background-color: #ff4545;
                                    color: #fff;
                                    text-decoration: none;
                                    border-radius: 4px;
                                    font-weight: bold;
                                }
                                
                                a:hover {
                                    background-color: #e63e3e;
                                }

                                .bottom {
                                    text-align: center;
                                }

                                .cep {
                                    display: flex;
                                    border-radius: 4px;
                                    font-weight: lighter;
                                    font-size: 12px;
                                    padding: 10px 20px

                                    
                                }

                        </style>
                    
                </head>
               
                <body>

                <h1>Seu Perfil</h1>

                <div class = "header">
                ${rows.map(row => `

                    <img src="/uploads/${row.imagemPath}" alt="Foto do Perfil">

               

                    <h2>${row.usuario} <span id="usuario"></span></h2>
                    <h3>${row.nickname} <span id="nickname"></span></h3>    

                        <div class = "cep">

                            <p>${row.cidade}<span id="cidade">|</span></p> <p>${row.estado}<span id="estado">|</span></p><p>${row.pais}<span id="pais"></span></p>

                        </div>

                        

                </div>
            
                
                <div class="about">

                    <h2>Resumo</h2>
                    <p>${row.resumo}</p>
                

                   
               
                </div> 
                
                <div class="bottom">
                    
                    <a href="/atualizar-form/${row.player_code}">Editar Perfil</a>
                    <a href="/deletar/${row.player_code}">Deletar Perfil</a>
                    <a href="/">Voltar para home</a>

                </div>
                `).join('')}
                
                       
                

                </body>    

            </html>
            `);
        } else {
            console.log("Erro ao listar os dados!: ", err);
            res.send("Erro!");
        }
    });
});


app.post('/atualizar/:player_code', upload.single('imagemPath'), (req, res) => {

    const player_code = req.params.player_code;
    const imagemPath = req.file.filename;
    const usuario = req.body.usuario;
    const nickname = req.body.nickname;
    const senha = req.body.senha;
    const resumo = req.body.resumo;
    const cidade = req.body.cidade;
    const estado = req.body.estado;
    const pais = req.body.pais;
   

    const updateQuery = "UPDATE perfil SET imagemPath = ?, usuario = ?, nickname = ?, senha = ?, resumo = ?, cidade = ?, estado = ?, pais = ? WHERE player_code = ?"

    connection.query(updateQuery, [imagemPath,usuario, nickname, senha, resumo, cidade, estado, pais, player_code], function(err, result){
        if (!err){

            console.log("Dados atualizados!");
            res.redirect('/listar');

        } else {
            console.log("Erro ao atualizar dados: ", err);
            res.status(500).send("Erro ao atualizar dados");
        }
    });
});

app.get("/deletar/:player_code", function(req, res){
    const player_code = req.params.player_code;

    const deletePlayer= "DELETE FROM perfil WHERE player_code = ?";

    connection.query(deletePlayer, [player_code], function(err, result) {
        if (!err) {
            console.log("Perfil deletado!");
            res.redirect('/'); 

        } else {
            console.log("Erro ao deletar perfil: ", err);
            res.status(500).send("Erro ao deletar perfil");
        }
    });
});


app.get("/atualizar-form/:player_code", function(req, res){
    const player_code = req.params.player_code;

    const selectPerfil = "SELECT * FROM perfil WHERE player_code = ?";
    
    connection.query(selectPerfil, [player_code], function(err, result) {
        if (!err && result.length > 0) {
            const perfil = result[0];

            res.send(`
<html>
    <head>

        <title>Atualizar Cadastro</title>

    <link rel="stylesheet" type="text/css" href="/estilo.css">



 </head>

    <body>

    <main>
               
         <div class="container">

             <div class="box">

                <h1>Atualizar Cadastro</h1>

                    <form action="/atualizar/${player_code}" method="POST" enctype="multipart/form-data">


                                <div class="field">    
                                    
                                    <input class = "input" type = "file" id = "imagemPath" name = "imagemPath"  value="${perfil.imagemPath}" accept="image/*">

                                </div>
                            
                                <div class="field">

                                    <input class = "input" type="text" id="usuario" name="usuario" value="${perfil.usuario}" placeholder ="Usuário" required><br>

                                </div> 
                                    
                                <div class="field">

                                    <input class = "input" type="text" id="nickname" name="nickname" value="${perfil.nickname}" placeholder ="Nickname" required><br>

                                </div>

                                <div class="field">
                                    <input class = "input" type="text" id="senha" name="senha" value="${perfil.senha}" placeholder ="Senha" required><br>

                                </div>

                                <div class="field">

                                    <input class = "input" type="text" id="resumo" name="resumo" value="${perfil.resumo}" placeholder ="Resumo" required><br>

                                </div>

                                <div class="field">

                                    <input class = "input" type="text" id="cidade" name="cidade" value="${perfil.cidade}" placeholder ="Cidade" required><br>

                                </div>

                                <div class="field">

                                    <input class = "input" type="text" id="estado" name="estado" value="${perfil.estado}" placeholder ="Estado" required><br>

                                </div>

                                <div class="field">

                                <input class = "input" type="text" id="pais" name="pais" value="${perfil.pais}" placeholder ="País" required><br>

                                </div>

                                    <input type="submit" value="Atualizar">

                                </form>

                            </div>

                        </div>

                    </main>

                </body>

            </html>

            `);
        } else {
            console.log("Erro ao obter dados do perfil: ", err);
            res.status(500).send("Erro ao obter dados do perfil");
        }
    });
});


app.listen(8081, function(){
    console.log("Servidor rodando na url http://localhost:8081")
})

