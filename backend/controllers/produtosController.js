// Importa o pool de conexões com o MySQL, já configurado em config/database.js
const pool = require('../config/database');



// GET /api/produtos
// Função que lista todos os produtos cadastrados, já trazendo o nome da categoria de cada um
async function listarProdutos(req, res) {
  try {
    // Executa a consulta SQL no banco; a desestruturação [produtos] pega só o array de linhas
    // retornado pelo mysql2 (que devolve [linhas, metadados])
    const [produtos] = await pool.query(
      // SELECT que traz todas as colunas de produtos (p.*) e o nome da categoria (c.nome_categoria)
      `SELECT p.*, c.nome_categoria
       FROM produtos p
       LEFT JOIN categorias c ON p.categoria_id = c.id_categoria
       ORDER BY p.nome_produto`
      // LEFT JOIN garante que produtos sem categoria também apareçam na lista (com categoria nula)
    );
    // Responde com status 200 (OK) e envia a lista de produtos em formato JSON
    res.status(200).json(produtos);
  } catch (erro) {
    // Se algo der errado na consulta, registra o erro no console do servidor
    console.error('Erro ao listar produtos:', erro.message);
    // E responde ao cliente com status 500 (erro interno do servidor) e uma mensagem amigável
    res.status(500).json({ erro: 'Erro ao buscar produtos.' });
  }
}



// GET /api/produtos/:id
// Função que busca um único produto pelo seu id
async function buscarProdutoPorId(req, res) {
  try {
    // Extrai o parâmetro ":id" da URL (ex: /api/produtos/5 -> id = "5")
    const { id } = req.params;
    // Faz a consulta usando "?" como placeholder e passando o valor de forma segura
    // (isso evita SQL Injection, diferente de concatenar a string diretamente)
    const [produtos] = await pool.query(
      'SELECT * FROM produtos WHERE id_produto = ?',
      [id]
    );

    // Se o array vier vazio, significa que nenhum produto tem esse id
    if (produtos.length === 0) {
      // Retorna imediatamente com status 404 (não encontrado) e uma mensagem de erro
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    // Se encontrou, responde com status 200 e apenas o primeiro (e único) produto do array
    res.status(200).json(produtos[0]);
  } catch (erro) {
    // Trata qualquer erro inesperado durante a busca
    console.error('Erro ao buscar produto:', erro.message);
    res.status(500).json({ erro: 'Erro ao buscar produto.' });
  }
}





// POST /api/produtos
// Função que cria um novo produto no banco de dados
async function criarProduto(req, res) {
  try {
    // Extrai (desestrutura) todos os campos esperados do corpo da requisição (JSON enviado pelo cliente)
    const {
      codigo_produto, nome_produto, descricao_produto, categoria_id,
      quantidade_produtos, estoque_minimo, preco_custo, preco_venda, fornecedor
    } = req.body;

    // Validação simples: código e nome são obrigatórios para criar um produto
    if (!codigo_produto || !nome_produto) {
      // Se algum estiver faltando, interrompe a função e responde com status 400 (requisição inválida)
      return res.status(400).json({ erro: 'Código e nome do produto são obrigatórios.' });
    }

    // Insere o novo produto no banco; cada "?" corresponde, na ordem, a um valor do array abaixo
    const [resultado] = await pool.query(
      `INSERT INTO produtos
        (codigo_produto, nome_produto, descricao_produto, categoria_id,
         quantidade_produtos, estoque_minimo, preco_custo, preco_venda, fornecedor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      // Para campos opcionais, usa "|| null" (ou "|| 0") para gravar um valor padrão
      // caso o campo não tenha sido enviado pelo cliente
      [codigo_produto, nome_produto, descricao_produto || null, categoria_id || null,
       quantidade_produtos || 0, estoque_minimo || 0, preco_custo || 0, preco_venda || 0,
       fornecedor || null]
    );

    // Responde com status 201 (criado) e devolve o id gerado automaticamente pelo banco (insertId)
    res.status(201).json({ mensagem: 'Produto criado com sucesso.', id: resultado.insertId });
  } catch (erro) {
    // Registra o erro no console do servidor
    console.error('Erro ao criar produto:', erro.message);

    // Trata especificamente o erro de código duplicado (a tabela tem uma constraint UNIQUE no código)
    if (erro.code === 'ER_DUP_ENTRY') {
      // Retorna uma mensagem mais clara para esse caso específico, com status 400
      return res.status(400).json({ erro: 'Já existe um produto com esse código.' });
    }

    // Para qualquer outro erro não previsto, responde com status 500 genérico
    res.status(500).json({ erro: 'Erro ao criar produto.' });
  }
}



// PUT /api/produtos/:id
// Função que atualiza os dados de um produto já existente
async function atualizarProduto(req, res) {
  try {
    // Pega o id do produto a partir da URL
    const { id } = req.params;
    // Pega os novos valores dos campos a partir do corpo da requisição
    const {
      nome_produto, descricao_produto, categoria_id,
      quantidade_produtos, estoque_minimo, preco_custo, preco_venda, fornecedor
    } = req.body;

    // Executa o UPDATE, atualizando todos os campos listados para o produto com o id informado
    const [resultado] = await pool.query(
      `UPDATE produtos SET
        nome_produto = ?, descricao_produto = ?, categoria_id = ?,
        quantidade_produtos = ?, estoque_minimo = ?, preco_custo = ?,
        preco_venda = ?, fornecedor = ?
       WHERE id_produto = ?`,
      [nome_produto, descricao_produto, categoria_id, quantidade_produtos,
       estoque_minimo, preco_custo, preco_venda, fornecedor, id]
    );

    // affectedRows indica quantas linhas foram alteradas; 0 significa que não existe produto com esse id
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    // Se pelo menos uma linha foi alterada, a atualização deu certo
    res.status(200).json({ mensagem: 'Produto atualizado com sucesso.' });
  } catch (erro) {
    // Trata qualquer erro inesperado durante a atualização
    console.error('Erro ao atualizar produto:', erro.message);
    res.status(500).json({ erro: 'Erro ao atualizar produto.' });
  }
}







// DELETE /api/produtos/:id
// Função que exclui um produto do banco de dados
async function excluirProduto(req, res) {
  try {
    // Pega o id do produto a partir da URL
    const { id } = req.params;
    // Executa o DELETE para o produto com esse id
    const [resultado] = await pool.query(
      'DELETE FROM produtos WHERE id_produto = ?',
      [id]
    );

    // Se nenhuma linha foi afetada, é porque o produto não existia
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    // Caso contrário, a exclusão foi bem-sucedida
    res.status(200).json({ mensagem: 'Produto excluído com sucesso.' });
  } catch (erro) {
    // Trata qualquer erro inesperado durante a exclusão
    console.error('Erro ao excluir produto:', erro.message);
    res.status(500).json({ erro: 'Erro ao excluir produto.' });
  }
}

// Exporta todas as funções deste controller para que routes/produtos.js possa usá-las
module.exports = {
  listarProdutos,
  buscarProdutoPorId,
  criarProduto,
  atualizarProduto,
  excluirProduto
};
