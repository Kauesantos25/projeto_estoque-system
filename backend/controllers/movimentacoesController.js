// Importa o pool de conexões com o MySQL
const pool = require('../config/database');

// GET /api/movimentacoes
// Lista todas as movimentações de estoque (entradas e saídas) já registradas
async function listarMovimentacoes(req, res) {
  try {
    // INNER JOIN traz também o código e nome do produto de cada movimentação
    // (diferente de LEFT JOIN, aqui exige que o produto exista, o que sempre é verdade
    // pois produto_id é NOT NULL e tem chave estrangeira para produtos)
    const [movimentacoes] = await pool.query(
      `SELECT m.*, p.codigo_produto, p.nome_produto
       FROM movimentacoes m
       INNER JOIN produtos p ON m.produto_id = p.id_produto
       ORDER BY m.data_movimentacoes DESC`
      // ORDER BY ... DESC mostra as movimentações mais recentes primeiro
    );
    // Responde com a lista de movimentações e status 200
    res.status(200).json(movimentacoes);
  } catch (erro) {
    // Trata qualquer erro inesperado ao listar as movimentações
    console.error('Erro ao listar movimentações:', erro.message);
    res.status(500).json({ erro: 'Erro ao buscar movimentações.' });
  }
}

// POST /api/movimentacoes
// Registra uma nova movimentação de entrada ou saída de um produto no estoque
async function criarMovimentacao(req, res) {
  try {
    // Extrai os dados enviados no corpo da requisição
    const { produto_id, tipo, quantidade, motivo } = req.body;

    // Verifica se os campos obrigatórios foram enviados
    if (!produto_id || !tipo || !quantidade) {
      // Se faltar algum, interrompe e responde com erro 400
      return res.status(400).json({ erro: 'Produto, tipo e quantidade são obrigatórios.' });
    }

    // O campo "tipo" só pode ser 'entrada' ou 'saida' (mesma regra do ENUM definido no banco)
    if (tipo !== 'entrada' && tipo !== 'saida') {
      // Caso venha qualquer outro valor, retorna erro explicando o valor esperado
      return res.status(400).json({ erro: "Tipo deve ser 'entrada' ou 'saida'." });
    }

    // A quantidade movimentada precisa ser um número positivo
    if (quantidade <= 0) {
      return res.status(400).json({ erro: 'Quantidade deve ser maior que zero.' });
    }

    // Insere a nova movimentação no banco; "motivo" é opcional, então usa null se não vier
    const [resultado] = await pool.query(
      'INSERT INTO movimentacoes (produto_id, tipo, quantidade, motivo) VALUES (?, ?, ?, ?)',
      [produto_id, tipo, quantidade, motivo || null]
    );

    // Responde com status 201 (criado) e o id gerado para a nova movimentação
    res.status(201).json({ mensagem: 'Movimentação registrada com sucesso.', id: resultado.insertId });
  } catch (erro) {
    // Registra o erro no console do servidor
    console.error('Erro ao criar movimentação:', erro.message);

    // Trata especificamente o caso em que o produto_id enviado não existe na tabela produtos
    // (esse erro vem da constraint de chave estrangeira fk_produtos_id_produto)
    if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ erro: 'Produto informado não existe.' });
    }

    // Para qualquer outro erro não previsto, responde com status 500 genérico
    res.status(500).json({ erro: 'Erro ao registrar movimentação.' });
  }
}

// Exporta as funções para serem usadas em routes/movimentacoes.js
module.exports = {
  listarMovimentacoes,
  criarMovimentacao
};
