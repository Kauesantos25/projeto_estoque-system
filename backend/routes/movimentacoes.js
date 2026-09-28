// Importa o Express para usar o sistema de rotas
const express = require('express');

// Cria um roteador dedicado às rotas de movimentações de estoque
const router = express.Router();

// Importa as funções que implementam a lógica de cada rota (controller de movimentações)
const movimentacoesController = require('../controllers/movimentacoesController');

// Rota GET /api/movimentacoes -> lista todas as movimentações (entradas e saídas) já registradas
router.get('/', movimentacoesController.listarMovimentacoes);

// Rota POST /api/movimentacoes -> registra uma nova movimentação (entrada ou saída) de um produto
router.post('/', movimentacoesController.criarMovimentacao);

// Exporta o roteador para ser usado no server.js
module.exports = router;
