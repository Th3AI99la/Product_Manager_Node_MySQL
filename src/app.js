//Importar modulos
const express = require('express');

require('dotenv').config();

// Importar module MySQL
const mysql = require('mysql2');

//App
const app = express();

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
    console.log('Conexão ao banco de dados efetuada com sucesso!');
  }
});

//Rota OlaMundo

app.get('/', function (req, res) {
  console.log('\nServidor Iniciado!');
  res.write('Mudado');
  res.end();
});

// Servidor
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
        console.log(`Servidor iniciado com sucesso!\nPORTA: ${PORTA}`);
    }
});

