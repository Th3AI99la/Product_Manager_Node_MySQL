// Importar express
const express = require('express');

// Importar fs
const fs = require('fs');

// Importar Fileupload

const fileupload = require('express-fileupload');

// Importar express-handlebars
const { engine } = require('express-handlebars');

// Importar segurança dotenv
require('dotenv').config();

// Importar module MySQL
const mysql = require('mysql2');

//App
const app = express();

// Habilitando o fileupload

app.use(fileupload());

// Configuração do Bootstrap

app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'));

// Configuração CSS
app.use(express.static('public'));

//Referciando a pasta de imagens

app.use('/src/images', express.static(__dirname + '/images'));

// Configuração do express-handlebars

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Manipulaçao de dados via rotas JSON-

app.use(express.json());
app.use(express.urlencoded({ express: false }));

// Configuração de conexão

const conexaoDB = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Teste de conexão ao DB

conexaoDB.connect(function (erro) {
  if (erro) {
    console.error('Erro ao conectar ao banco de dados:', erro.message);

    // Tratar erros específicos, se necessário
    if (erro.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Conexão com o servidor MySQL foi perdida.');
    } else if (erro.code === 'ER_CON_COUNT_ERROR') {
      console.error('O banco de dados tem muitas conexões.');
    } else if (erro.code === 'ECONNREFUSED') {
      console.error(
        'Conexão com o banco de dados foi recusada. Verifique as configurações do banco de dados.',
      );
    } else {
      console.error('Erro desconhecido ao conectar ao banco de dados.');
    }

    // Encerrar o aplicativo ou tomar outras medidas, se necessário
    process.exit(1);
  } else {
    console.log('Conexão ao banco de dados efetuada com sucesso!\n');
  }
});

//Rota Principal (nao precisa colocar o .handlebars)

app.get('/', function (req, res) {
  //SQL
  let sql = 'SELECT * FROM produtos';
  //Executar comando SQL
  conexaoDB.query(sql, function (erro, retorno) {
    res.render('forms', { produtos: retorno });
  });
});

// Rota para adcionar estrelas (rating)
app.get('/', function (req, res) {
  // SQL para obter produtos com suas avaliações
  let sql =
    'SELECT p.*, AVG(a.rating) as media_avaliacao FROM produtos p LEFT JOIN avaliacoes a ON p.id_produto = a.id_produto GROUP BY p.id_produto';

  // Executar comando SQL
  conexaoDB.query(sql, function (erro, retorno) {
    res.render('forms', { produtos: retorno });
  });
});

// Rota de Cadastro (Register)

app.post('/register', (req, res) => {
  // Obter os dados cadastrais do Banco de dados
  let nome = req.body.nome;
  let valor = req.body.valor;

  // Verificar se há um arquivo de imagem na requisição
  if (!req.files || !req.files.imagem || !req.files.imagem.name) {
    return res.status(400).send('Nenhum arquivo de imagem foi enviado.');
  }

  let imagem = req.files.imagem.name;

  // Construir a query SQL
  let sql = `INSERT INTO produtos (nome, valor, imagem) VALUES ('${nome}', ${valor}, '${imagem}')`;

  // Verificar se o diretório 'images' existe, caso contrário, criar
  const imagesDirectory = __dirname + '/images';
  if (!fs.existsSync(imagesDirectory)) {
    fs.mkdirSync(imagesDirectory);
  }

  // Executar SQL
  conexaoDB.query(sql, function (erro, retorno) {
    // Verificar se houve algum erro na execução do SQL
    if (erro) {
      console.error(erro);
      return res.status(500).send('Erro ao cadastrar o produto.');
    }

    // Mover o arquivo de imagem para a pasta 'images'
    req.files.imagem.mv(
      __dirname + '/images/' + req.files.imagem.name,
      function (erro_saving_image) {
        if (erro_saving_image) {
          console.error(erro_saving_image);
          return res.status(500).send('Erro ao salvar a imagem.');
        }

        // Produto cadastrado e imagem salva com sucesso
        console.log(retorno);

        // Redirecionar para a rota principal após o cadastro
        res.redirect('/');
      },
    );
  });
});

// ESTRELAS POST
app.post('/avaliar/:id_produto', (req, res) => {
  let id_produto = req.params.id_produto;
  let rating = req.body.rating;

  let sql = `INSERT INTO avaliacoes (id_produto, rating) VALUES (${id_produto}, ${rating})`;

  // Executar SQL
  conexaoDB.query(sql, function (erro, retorno) {
    if (erro) {
      console.error(erro);
      return res.status(500).send('Erro ao avaliar o produto.');
    }

    res.redirect('/');
  });
});

// Configuração do Servidor
const PORTA = 3000;

const servidor = app.listen(PORTA, function (erro) {
  if (erro) {
    console.error('Erro ao iniciar o servidor:', erro.message);

    // Tratar erros específicos, se necessário
    if (erro.code === 'EADDRINUSE') {
      console.error(`A porta ${PORTA} está em uso. Escolha outra porta.`);
    } else {
      console.error('Erro desconhecido ao iniciar o servidor.');
    }

    // Encerrar o aplicativo ou tomar outras medidas, se necessário
    process.exit(1);
  } else {
    console.log(`\nServidor iniciado com sucesso!\nPORTA: ${PORTA}`);
  }
});
