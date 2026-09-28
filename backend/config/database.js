// Carrega as variáveis de ambiente definidas no arquivo .env (DB_HOST, DB_USER, etc.)
// e as injeta em process.env, para que possam ser usadas neste arquivo
require('dotenv').config();

// Importa a versão "promise" do driver mysql2, que permite usar async/await em vez de callbacks
const mysql = require('mysql2/promise');


// Cria um "pool" de conexões com o MySQL (em vez de uma única conexão),
// o que permite várias requisições simultâneas reaproveitando conexões já abertas
const pool = mysql.createPool({
  host: process.env.DB_HOST,       // Endereço do servidor MySQL (ex: localhost)
  user: process.env.DB_USER,       // Usuário do banco de dados
  password: process.env.DB_PASSWORD, // Senha do usuário do banco de dados
  database: process.env.DB_NAME,   // Nome do banco de dados que será usado (db_estoque)
  port: process.env.DB_PORT,       // Porta do MySQL (padrão 3306)
  waitForConnections: true,        // Se todas as conexões do pool estiverem ocupadas, espera uma ficar livre em vez de dar erro na hora
  connectionLimit: 10,             // Número máximo de conexões simultâneas que o pool pode manter abertas
  queueLimit: 0                    // 0 significa fila de espera ilimitada para pedir uma conexão livre
});


// Função assíncrona que apenas testa se a conexão com o banco está funcionando
async function testarConexao() {
  try {
    // Pega emprestada uma conexão do pool
    const conexao = await pool.getConnection();

    // Se chegou até aqui, a conexão deu certo
    console.log('Conectado ao MySQL com sucesso!');
    
    // Devolve a conexão para o pool (importante: sem isso, a conexão ficaria "presa")
    conexao.release();
  } catch (erro) {
    // Caso a conexão falhe (ex: senha errada, banco fora do ar), mostra o motivo no console
    console.error('Erro ao conectar ao MySQL:', erro.message);
  }
}

// Executa o teste de conexão assim que este arquivo é carregado pela primeira vez
testarConexao();

// Exporta o pool de conexões para que outros arquivos (os controllers) possam
// usá-lo para fazer consultas (pool.query(...)) ao banco de dados
module.exports = pool;
