// Importa o framework Express, usado para criar o servidor web e as rotas da API
const express = require('express');

// Importa o middleware CORS, que libera o acesso da API para outros domínios/origens (ex: o frontend)
const cors = require('cors');

// Executa o arquivo de configuração do banco (ele já cria e testa a conexão sozinho ao ser importado)
require('./config/database');

// Importa o arquivo de rotas responsável pelos endpoints de produtos
const produtosRoutes = require('./routes/produtos');

// Importa o arquivo de rotas responsável pelos endpoints de categorias
const categoriasRoutes = require('./routes/categorias');

// Importa o arquivo de rotas responsável pelos endpoints de movimentações de estoque
const movimentacoesRoutes = require('./routes/movimentacoes');

// Cria a aplicação Express, que é o "servidor" em si
const app = express();

// Define a porta em que o servidor vai rodar: usa a variável de ambiente PORT (definida no .env)
// ou, se ela não existir, usa 3000 como valor padrão
const PORT = process.env.PORT || 3000;

// Ativa o CORS para todas as rotas, permitindo requisições vindas de outras origens (ex: front-end em outra porta)
app.use(cors());

// Ativa o middleware que faz o Express entender automaticamente corpos de requisição no formato JSON
// (sem isso, req.body chegaria undefined nas rotas POST/PUT)
app.use(express.json());

// Registra as rotas de produtos: qualquer requisição para /api/produtos/... será tratada por produtosRoutes
app.use('/api/produtos', produtosRoutes);

// Registra as rotas de categorias: qualquer requisição para /api/categorias/... será tratada por categoriasRoutes
app.use('/api/categorias', categoriasRoutes);

// Registra as rotas de movimentações: qualquer requisição para /api/movimentacoes/... será tratada por movimentacoesRoutes
app.use('/api/movimentacoes', movimentacoesRoutes);


// Define uma rota simples GET na raiz ("/") apenas para confirmar que o servidor está no ar
app.get('/', (req, res) => {
  // Envia uma resposta de texto simples ao navegador/cliente que acessar essa rota
  res.send('Servidor do sistema de estoque está rodando!');
});

// Inicia o servidor, fazendo-o "escutar" requisições na porta definida
app.listen(PORT, () => {
  // Callback executado assim que o servidor sobe com sucesso; mostra no terminal o endereço de acesso
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
