// Importa o pool de conexões com o MySQL
const pool = require('../config/database');

// GET /api/categorias
// Lista todas as categorias, já contando quantos produtos existem em cada uma
async function listarCategorias(req, res) {
  try {
    // COUNT(p.id_produto) conta quantos produtos estão ligados a cada categoria
    const [categorias] = await pool.query(
      `SELECT c.*, COUNT(p.id_produto) AS total_produtos
       FROM categorias c
       LEFT JOIN produtos p ON p.categoria_id = c.id_categoria
       GROUP BY c.id_categoria
       ORDER BY c.nome_categoria`
      // GROUP BY é obrigatório aqui porque estamos usando uma função de agregação (COUNT)
      // LEFT JOIN garante que categorias sem nenhum produto apareçam com total_produtos = 0
    );
    // Envia a lista de categorias como resposta, com status 200
    res.status(200).json(categorias);
  } catch (erro) {
    // Em caso de erro na consulta, registra no console e responde com status 500
    console.error('Erro ao listar categorias:', erro.message);
    res.status(500).json({ erro: 'Erro ao buscar categorias.' });
  }
}

// POST /api/categorias
// Cria uma nova categoria
async function criarCategoria(req, res) {
  try {
    // Extrai os campos enviados no corpo da requisição
    const { nome_categoria, descricao } = req.body;

    // O nome da categoria é obrigatório
    if (!nome_categoria) {
      // Interrompe e responde com erro 400 caso o nome não tenha sido enviado
      return res.status(400).json({ erro: 'Nome da categoria é obrigatório.' });
    }

    // Insere a nova categoria no banco; se "descricao" não vier, grava null
    const [resultado] = await pool.query(
      'INSERT INTO categorias (nome_categoria, descricao) VALUES (?, ?)',
      [nome_categoria, descricao || null]
    );

    // Responde com status 201 (criado) e o id gerado automaticamente para a nova categoria
    res.status(201).json({ mensagem: 'Categoria criada com sucesso.', id: resultado.insertId });
  } catch (erro) {
    // Trata qualquer erro inesperado ao criar a categoria
    console.error('Erro ao criar categoria:', erro.message);
    res.status(500).json({ erro: 'Erro ao criar categoria.' });
  }
}

// PUT /api/categorias/:id
// Atualiza uma categoria existente
async function atualizarCategoria(req, res) {
  try {
    // Id da categoria vindo da URL
    const { id } = req.params;
    // Novos valores vindos do corpo da requisição
    const { nome_categoria, descricao } = req.body;

    // Atualiza nome e descrição da categoria com o id informado
    const [resultado] = await pool.query(
      'UPDATE categorias SET nome_categoria = ?, descricao = ? WHERE id_categoria = ?',
      [nome_categoria, descricao, id]
    );

    // Se nenhuma linha foi alterada, a categoria não existe
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Categoria não encontrada.' });
    }

    // Caso contrário, a atualização foi bem-sucedida
    res.status(200).json({ mensagem: 'Categoria atualizada com sucesso.' });
  } catch (erro) {
    // Trata qualquer erro inesperado durante a atualização
    console.error('Erro ao atualizar categoria:', erro.message);
    res.status(500).json({ erro: 'Erro ao atualizar categoria.' });
  }
}

// DELETE /api/categorias/:id
// Exclui uma categoria existente
async function excluirCategoria(req, res) {
  try {
    // Id da categoria vindo da URL
    const { id } = req.params;
    // Executa a exclusão da categoria com esse id
    const [resultado] = await pool.query(
      'DELETE FROM categorias WHERE id_categoria = ?',
      [id]
    );

    // Se nenhuma linha foi afetada, a categoria não existia
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Categoria não encontrada.' });
    }

    // Caso contrário, a exclusão foi bem-sucedida
    // (lembrando que, pela regra do banco, os produtos dessa categoria NÃO são apagados,
    // apenas ficam com categoria_id = NULL, conforme definido no ON DELETE SET NULL do SQL)
    res.status(200).json({ mensagem: 'Categoria excluída com sucesso.' });
  } catch (erro) {
    // Trata qualquer erro inesperado durante a exclusão
    console.error('Erro ao excluir categoria:', erro.message);
    res.status(500).json({ erro: 'Erro ao excluir categoria.' });
  }
}

// Exporta todas as funções para serem usadas em routes/categorias.js
module.exports = {
  listarCategorias,
  criarCategoria,
  atualizarCategoria,
  excluirCategoria
};
