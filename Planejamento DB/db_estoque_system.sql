/* CRIAÇÃO DO DB */
CREATE DATABASE db_estoque;
USE db_estoque;


/* CRIAÇÃO DAS TABELAS */
CREATE TABLE categorias (
  id_categoria INT NOT NULL AUTO_INCREMENT,
  nome_categoria VARCHAR(100) NOT NULL,
  descricao VARCHAR(255),

  CONSTRAINT pk_categoria PRIMARY KEY (id_categoria)
);


CREATE TABLE produtos(
	id_produto INT NOT NULL AUTO_INCREMENT,
    codigo_produto VARCHAR (20) NOT NULL,
    nome_produto VARCHAR(150) NOT NULL,
    descricao_produto VARCHAR(255),
    quantidade_produtos INT NOT NULL DEFAULT 0,
    estoque_minimo INT NOT NULL DEFAULT 0,
    preco_custo DECIMAL(10,2) NOT NULL DEFAULT 0,
    preco_venda DECIMAL(10,2) NOT NULL DEFAULT 0,
    fornecedor varchar (150), 
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    categoria_id INT,  /* FK */
    
    CONSTRAINT pk_produto PRIMARY KEY (id_produto),
    CONSTRAINT uq_produto_codigo UNIQUE (codigo_produto),
    CONSTRAINT fk_categorias_id_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (id_categoria)
    ON DELETE SET NULL  			/*Mantém o filho e define a chave estrangeira como NULL, 
									ou seja, caso apague algum categoria, o porduto que está 
                                    dentro dela se manterá no DB*/
);


CREATE TABLE movimentacoes(
	id_movimentacoes INT NOT NULL AUTO_INCREMENT,
    tipo ENUM ('entrada' , 'saida') NOT NULL,
    quantidade INT NOT NULL, 
    motivo VARCHAR (255),
    data_movimentacoes DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    produto_id INT NOT NULL, /* FK */
    
    CONSTRAINT pk_movimentacao PRIMARY KEY (id_movimentacoes),
    CONSTRAINT fk_produtos_id_produto
    FOREIGN KEY (produto_id) REFERENCES produtos(id_produto)
    ON DELETE CASCADE
);



/* INSERTS PARA CADA TABELA */
INSERT INTO categorias (nome_categoria, descricao) VALUES
  ('Fixação', 'Parafusos, porcas, buchas'),
  ('EPI', 'Equipamentos de proteção individual'),
  ('Elétrico', 'Fios, cabos, conectores');
  
  
  
  INSERT INTO produtos
  (codigo_produto, nome_produto, descricao_produto, quantidade_produtos, estoque_minimo, preco_custo, preco_venda, fornecedor, categoria_id)
VALUES
  ('PRD-0032', 'Parafuso M4 20mm', 'Parafuso sextavado', 12, 50, 0.30, 0.45, 'Fixtec Ltda', 1),
  ('PRD-0055', 'Capacete de segurança', 'Capacete classe A', 64, 10, 28.00, 38.90, 'ProteJá', 2),
  ('PRD-0089', 'Fita isolante 20m', 'Fita isolante preta', 8, 15, 4.10, 6.20, 'Voltmax', 3),
  ('PRD-0104', 'Cabo flexível 2,5mm', 'Cabo flexível para instalações', 210, 100, 1.50, 2.10, 'Voltmax', 3);
  
  
  INSERT INTO movimentacoes (tipo, quantidade, motivo, produto_id) VALUES
  ('entrada', 100, 'Compra inicial de estoque', 1),
  ('saida', 88, 'Venda #4471', 1),
  ('entrada', 50, 'Compra Voltmax', 3),
  ('entrada', 210, 'Compra inicial de estoque', 4);
  
  
  
SELECT * FROM categorias;
SELECT * FROM produtos;
SELECT * FROM movimentacoes;


SELECT p.id_produto, p.codigo_produto, p.nome_produto, c.nome_categoria, p.quantidade_produtos
FROM produtos p
LEFT JOIN categorias c ON p.categoria_id = c.id_categoria;