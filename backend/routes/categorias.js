// Importa o Express para usar o sistema de rotas
const express = require('express');

// Cria um roteador dedicado às rotas de categorias
const router = express.Router();

// Importa as funções que implementam a lógica de cada rota (controller de categorias)
const categoriasController = require('../controllers/categoriasController');

// Rota GET /api/categorias -> lista todas as categorias cadastradas
router.get('/', categoriasController.listarCategorias);
// Rota POST /api/categorias -> cria uma nova categoria com os dados enviados no body
router.post('/', categoriasController.criarCategoria);
// Rota PUT /api/categorias/:id -> atualiza a categoria cujo id foi passado na URL
router.put('/:id', categoriasController.atualizarCategoria);
// Rota DELETE /api/categorias/:id -> exclui a categoria cujo id foi passado na URL
router.delete('/:id', categoriasController.excluirCategoria);

// Exporta o roteador para ser usado no server.js
module.exports = router;
