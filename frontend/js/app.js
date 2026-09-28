// URL base da API — usada por todas as páginas
const API_BASE_URL = 'http://localhost:3000/api';

// Função central de comunicação com a API
async function apiFetch(caminho, opcoes = {}) {
  const resposta = await fetch(`${API_BASE_URL}${caminho}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opcoes
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro desconhecido na API.');
  }

  return dados;
}

// Formata número para moeda brasileira (R$)
function formatarMoeda(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Marca o item ativo do menu lateral, com base na página atual
function marcarMenuAtivo() {
  const paginaAtual = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('href') === paginaAtual) {
      item.classList.add('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', marcarMenuAtivo);