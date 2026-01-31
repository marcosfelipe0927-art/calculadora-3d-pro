-- ============================================================================
-- Script SQL para Criar Tabelas de Segurança no Supabase
-- RLS DESATIVADO (Público) para teste inicial
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Abra o Supabase Dashboard: https://app.supabase.com
-- 2. Vá para: SQL Editor → New Query
-- 3. Cole TODO o conteúdo deste arquivo
-- 4. Clique em "Run" para executar
-- 5. Verifique se as tabelas foram criadas em: Tables
--
-- ============================================================================

-- ============================================================================
-- TABELA 1: historico_dispositivos
-- Rastreia todos os dispositivos que já usaram cada token
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.historico_dispositivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) NOT NULL,
  fingerprint_id TEXT NOT NULL,
  primeiro_acesso TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  bloqueado_ate TIMESTAMP WITH TIME ZONE,
  motivo_bloqueio VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(token, fingerprint_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_token_historico ON public.historico_dispositivos(token);
CREATE INDEX IF NOT EXISTS idx_fingerprint_historico ON public.historico_dispositivos(fingerprint_id);
CREATE INDEX IF NOT EXISTS idx_bloqueado_ate ON public.historico_dispositivos(bloqueado_ate);

-- Desativar RLS para teste inicial (PÚBLICO)
ALTER TABLE public.historico_dispositivos DISABLE ROW LEVEL SECURITY;

-- Criar política de leitura pública (opcional, já que RLS está desativado)
CREATE POLICY "Public Read" ON public.historico_dispositivos
  FOR SELECT USING (true);

-- Criar política de escrita pública (opcional, já que RLS está desativado)
CREATE POLICY "Public Write" ON public.historico_dispositivos
  FOR INSERT WITH CHECK (true);

-- Criar política de atualização pública (opcional, já que RLS está desativado)
CREATE POLICY "Public Update" ON public.historico_dispositivos
  FOR UPDATE USING (true) WITH CHECK (true);

-- Criar política de deleção pública (opcional, já que RLS está desativado)
CREATE POLICY "Public Delete" ON public.historico_dispositivos
  FOR DELETE USING (true);

-- ============================================================================
-- TABELA 2: tentativas_bloqueadas
-- Auditoria de tentativas de login bloqueadas
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tentativas_bloqueadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) NOT NULL,
  fingerprint_id TEXT NOT NULL,
  data_tentativa TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  motivo VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_token_tentativas ON public.tentativas_bloqueadas(token);
CREATE INDEX IF NOT EXISTS idx_data_tentativa ON public.tentativas_bloqueadas(data_tentativa);

-- Desativar RLS para teste inicial (PÚBLICO)
ALTER TABLE public.tentativas_bloqueadas DISABLE ROW LEVEL SECURITY;

-- Criar política de leitura pública (opcional, já que RLS está desativado)
CREATE POLICY "Public Read" ON public.tentativas_bloqueadas
  FOR SELECT USING (true);

-- Criar política de escrita pública (opcional, já que RLS está desativado)
CREATE POLICY "Public Write" ON public.tentativas_bloqueadas
  FOR INSERT WITH CHECK (true);

-- Criar política de atualização pública (opcional, já que RLS está desativado)
CREATE POLICY "Public Update" ON public.tentativas_bloqueadas
  FOR UPDATE USING (true) WITH CHECK (true);

-- Criar política de deleção pública (opcional, já que RLS está desativado)
CREATE POLICY "Public Delete" ON public.tentativas_bloqueadas
  FOR DELETE USING (true);

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Verificar se as tabelas foram criadas
SELECT 
  table_name,
  'Criada com sucesso!' as status
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name IN ('historico_dispositivos', 'tentativas_bloqueadas')
ORDER BY table_name;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
--
-- 1. RLS DESATIVADO: As tabelas estão públicas para teste inicial.
--    Em produção, ative RLS com políticas de segurança apropriadas.
--
-- 2. ÍNDICES: Foram criados para melhorar performance em buscas.
--
-- 3. TIMESTAMPS: Todos usam TIMESTAMP WITH TIME ZONE para evitar problemas
--    com fusos horários.
--
-- 4. UUID: Chave primária é UUID para melhor distribuição e segurança.
--
-- 5. UNIQUE CONSTRAINT: historico_dispositivos tem UNIQUE(token, fingerprint_id)
--    para evitar duplicatas.
--
-- ============================================================================
