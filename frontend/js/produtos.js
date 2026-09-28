let produtos = [];
let categorias = [];
let idParaExcluir = null;

// Carrega produtos e categorias assim que a página abre
document.addEventListener('DOMContentLoaded', () => {
  carregarCategorias();
  carregarProdutos();

  document.getElementById('formProduto').addEventListener('submit', salvarProduto);
  document.getElementById('campoBusca').addEventListener('input', filtrarProdutos);
});

// ----- LISTAR -----
async function carregarProdutos() {
  try {
    produtos = await apiFetch('/produtos');
    renderizarTabela(produtos);
  } catch (erro) {
    console.error('Erro ao carregar produtos:', erro.message);
  }
}

async function carregarCategorias() {
  try {
    categorias = await apiFetch('/categorias');
    const select = document.getElementById('categoriaProduto');
    categorias.forEach(cat => {
      const opcao = document.createElement('option');
      opcao.value = cat.id_categoria;
      opcao.textContent = cat.nome_categoria;
      select.appendChild(opcao);
    });
  } catch (erro) {
    console.error('Erro ao carregar categorias:', erro.message);
  }
}

function renderizarTabela(lista) {
  const corpo = document.getElementById('corpoTabela');
  const mensagemVazia = document.getElementById('mensagemVazia');
  document.getElementById('totalProdutos').textContent = `${lista.length} produtos cadastrados`;

  corpo.innerHTML = '';

  if (lista.length === 0) {
    mensagemVazia.classList.remove('hidden');
    return;
  }
  mensagemVazia.classList.add('hidden');

  lista.forEach(produto => {
    const baixo = produto.quantidade_produtos < produto.estoque_minimo;
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td class="code">${produto.codigo_produto}</td>
      <td>${produto.nome_produto}</td>
      <td>${produto.nome_categoria || '—'}</td>
      <td>${produto.quantidade_produtos}</td>
      <td>${formatarMoeda(produto.preco_venda)}</td>
      <td><span class="pill ${baixo ? 'low' : 'ok'}">${baixo ? 'Baixo' : 'OK'}</span></td>
      <td class="row-actions">
        <button onclick="editarProduto(${produto.id_produto})">Editar</button>
        <button onclick="abrirExclusao(${produto.id_produto}, '${produto.nome_produto}')">Excluir</button>
      </td>
    `;
    corpo.appendChild(linha);
  });
}

// ----- BUSCA (filtro local, sem nova requisição) -----
function filtrarProdutos() {
  const termo = document.getElementById('campoBusca').value.toLowerCase();
  const filtrados = produtos.filter(p =>
    p.codigo_produto.toLowerCase().includes(termo) ||
    p.nome_produto.toLowerCase().includes(termo)
  );
  renderizarTabela(filtrados);
}

// ----- CRIAR / EDITAR -----
function abrirFormulario() {
  document.getElementById('tituloFormulario').textContent = 'Cadastrar produto';
  document.getElementById('formProduto').reset();
  document.getElementById('idProduto').value = '';
  document.getElementById('erroFormulario').classList.add('hidden');
  document.getElementById('modalFormulario').classList.remove('hidden');
}

function editarProduto(id) {
  const produto = produtos.find(p => p.id_produto === id);
  if (!produto) return;

  document.getElementById('tituloFormulario').textContent = 'Editar produto';
  document.getElementById('idProduto').value = produto.id_produto;
  document.getElementById('codigoProduto').value = produto.codigo_produto;
  document.getElementById('nomeProduto').value = produto.nome_produto;
  document.getElementById('descricaoProduto').value = produto.descricao_produto || '';
  document.getElementById('categoriaProduto').value = produto.categoria_id || '';
  document.getElementById('fornecedorProduto').value = produto.fornecedor || '';
  document.getElementById('quantidadeProduto').value = produto.quantidade_produtos;
  document.getElementById('estoqueMinimoProduto').value = produto.estoque_minimo;
  document.getElementById('precoCustoProduto').value = produto.preco_custo;
  document.getElementById('precoVendaProduto').value = produto.preco_venda;
  document.getElementById('erroFormulario').classList.add('hidden');
  document.getElementById('modalFormulario').classList.remove('hidden');
}

function fecharFormulario() {
  document.getElementById('modalFormulario').classList.add('hidden');
}

async function salvarProduto(evento) {
  evento.preventDefault();

  const id = document.getElementById('idProduto').value;
  const dados = {
    codigo_produto: document.getElementById('codigoProduto').value,
    nome_produto: document.getElementById('nomeProduto').value,
    descricao_produto: document.getElementById('descricaoProduto').value,
    categoria_id: document.getElementById('categoriaProduto').value || null,
    fornecedor: document.getElementById('fornecedorProduto').value,
    quantidade_produtos: Number(document.getElementById('quantidadeProduto').value),
    estoque_minimo: Number(document.getElementById('estoqueMinimoProduto').value),
    preco_custo: Number(document.getElementById('precoCustoProduto').value),
    preco_venda: Number(document.getElementById('precoVendaProduto').value)
  };

  try {
    if (id) {
      await apiFetch(`/produtos/${id}`, { method: 'PUT', body: JSON.stringify(dados) });
    } else {
      await apiFetch('/produtos', { method: 'POST', body: JSON.stringify(dados) });
    }
    fecharFormulario();
    carregarProdutos();
  } catch (erro) {
    const elementoErro = document.getElementById('erroFormulario');
    elementoErro.textContent = erro.message;
    elementoErro.classList.remove('hidden');
  }
}

// ----- EXCLUIR -----
function abrirExclusao(id, nome) {
  idParaExcluir = id;
  document.getElementById('textoExclusao').textContent =
    `Tem certeza que deseja excluir "${nome}"? Essa ação não pode ser desfeita.`;
  document.getElementById('modalExclusao').classList.remove('hidden');
}

function fecharExclusao() {
  idParaExcluir = null;
  document.getElementById('modalExclusao').classList.add('hidden');
}

async function confirmarExclusao() {
  try {
    await apiFetch(`/produtos/${idParaExcluir}`, { method: 'DELETE' });
    fecharExclusao();
    carregarProdutos();
  } catch (erro) {
    console.error('Erro ao excluir produto:', erro.message);
    fecharExclusao();
  }
}