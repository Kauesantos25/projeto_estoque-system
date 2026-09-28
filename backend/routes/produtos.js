// Importa o Express para poder usar o seu sistema de rotas
const express = require('express');

// Cria um "roteador" do Express: um mini-conjunto de rotas que depois é "plugado" no server.js
const router = express.Router();

// Importa as funções que realmente contêm a lógica de cada rota (o controller de produtos)
const produtosController = require('../controllers/produtosController');

// Rota GET /api/produtos -> lista todos os produtos cadastrados
router.get('/', produtosController.listarProdutos);

// Rota GET /api/produtos/:id -> busca um único produto pelo seu id (":id" é um parâmetro dinâmico na URL)
router.get('/:id', produtosController.buscarProdutoPorId);

// Rota POST /api/produtos -> cria um novo produto com os dados enviados no corpo (body) da requisição
router.post('/', produtosController.criarProduto);

// Rota PUT /api/produtos/:id -> atualiza um produto existente, identificado pelo id na URL
router.put('/:id', produtosController.atualizarProduto);

// Rota DELETE /api/produtos/:id -> exclui um produto existente, identificado pelo id na URL
router.delete('/:id', produtosController.excluirProduto);

// Exporta o roteador para que o server.js possa registrá-lo com app.use('/api/produtos', ...)
module.exports = router;
