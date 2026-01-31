-- Criar tabela sessoes_ativas
CREATE TABLE IF NOT EXISTS sessoes_ativas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) UNIQUE NOT NULL,
  fingerprint_id VARCHAR(255) NOT NULL,
  ultima_atividade TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_sessoes_token ON sessoes_ativas(token);
CREATE INDEX IF NOT EXISTS idx_sessoes_fingerprint ON sessoes_ativas(fingerprint_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE sessoes_ativas ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura/escrita
CREATE POLICY "Allow all operations on sessoes_ativas" ON sessoes_ativas
  FOR ALL
  USING (true)
  WITH CHECK (true);
