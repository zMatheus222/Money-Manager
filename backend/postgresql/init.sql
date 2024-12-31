-- Create Rendas table
CREATE TABLE Rendas (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    date_start DATE,
    date_end DATE
);

-- Create Economias table
CREATE TABLE Economias (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    date_start DATE,
    date_end DATE
);

-- Create Gastos table
CREATE TABLE Gastos (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    economia_id VARCHAR(50) REFERENCES Economias(id),
    valor DECIMAL(10, 2) NOT NULL,
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    date_start DATE,
    date_end DATE
);

-- Insert data into Rendas
-- INSERT INTO Rendas (nome, valor, is_recurring, date_start, date_end) VALUES
-- ('Salário', 2124.00, true, '2025-01-16', NULL);

-- Insert data into Economias
-- INSERT INTO Economias (nome, valor, is_recurring, date_start, date_end) VALUES
-- ('Placa de video', 250.00, true, '2025-02-16', NULL),
-- ('Lazer', 250.00, true, '2025-02-16', NULL),
-- ('Economias', 220.00, true, '2025-02-16', NULL);

-- Insert data into Gastos
--('Psicologa Terapia', 'Terapia (2 sessões Mês)', NULL, 240.00, true, '2023-01-01', NULL),
--LINHA EXEMPLO LAZER ('Atividade', 'Descricao', (SELECT id FROM Economias WHERE nome = 'Lazer'), 239.20, false, '2023-01-26', '2023-01-26'),
-- INSERT INTO Gastos (nome, descricao, economia_id, valor, is_recurring, date_start, date_end) VALUES
-- ('HostMF rpm-backend', 'Serviço de hospedagem', NULL, 39.90, true, '2025-01-16', NULL),
-- ('HostMF rpm-windows-acc-server', 'Serviço de hospedagem', NULL, 39.90, true, '2025-01-16', NULL),
-- ('HostMF rpm-o11y', 'Serviço de hospedagem', NULL, 39.90, true, '2025-01-16', NULL),
-- ('Talklink Internet', 'Serviço de internet', NULL, 89.90, true, '2025-01-16', NULL),
-- ('Pipoca Ração', 'Alimentação Pet', NULL, 60.00, true, '2025-01-16', NULL),
-- ('Google Drive 100gb', 'Serviço de armazenamento em nuvem', NULL, 7.99, true, '2025-01-16', NULL),
-- ('Fatura Cartao Lazer 26/12', NULL, NULL, 239.20, false, '2025-01-16', NULL),
-- ('Impressão certificado Encceja', NULL, NULL, 4.30, false, '2025-01-16', NULL),
-- ('Fatura Cartao Janeiro', '', NULL, 1483.11, false, '2025-01-16', NULL),
-- ('Fatura Cartao Fevereiro', '', NULL, 679.56, false, '2025-02-16', NULL),
-- ('Fatura Cartao Março', '', NULL, 629.90, false, '2025-03-16', NULL),
-- ('Fatura Cartao Abril', '', NULL, 569.10, false, '2025-04-16', NULL),
-- ('Fatura Cartao Maio', '', NULL, 365.80, false, '2025-05-16', NULL),
-- ('Fatura Cartao Junho', '', NULL, 86.00, false, '2025-06-16', NULL),
-- ('Fatura Cartao Julho', '', NULL, 86.00, false, '2025-07-16', NULL),
-- ('Fatura Cartao Agosto', '', NULL, 86.00, false, '2025-08-16', NULL);