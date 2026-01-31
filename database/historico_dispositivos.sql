-- Tabela para rastrear dispositivos únicos por token
-- Regra: Máximo 3 dispositivos diferentes por token
-- Se tentar logar em 4º dispositivo, bloqueia por 15 dias

CREATE TABLE IF NOT EXISTS historico_dispositivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) NOT NULL,
  fingerprint_id TEXT NOT NULL,
  primeiro_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  bloqueado_ate TIMESTAMP,
  motivo_bloqueio VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraint: token + fingerprint devem ser únicos
  UNIQUE(token, fingerprint_id),
  
  -- Índices para melhor performance
  INDEX idx_token (token),
  INDEX idx_fingerprint (fingerprint_id),
  INDEX idx_bloqueado_ate (bloqueado_ate)
);

-- Tabela para rastrear tentativas de login bloqueadas (auditoria)
CREATE TABLE IF NOT EXISTS tentativas_bloqueadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) NOT NULL,
  fingerprint_id TEXT NOT NULL,
  data_tentativa TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  motivo VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_token (token),
  INDEX idx_data_tentativa (data_tentativa)
);
