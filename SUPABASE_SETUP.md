# Configuração do Supabase para Calculadora 3D PRO

## Tabelas Necessárias

Este documento descreve as tabelas que devem ser criadas no Supabase para o funcionamento completo do sistema de autenticação e controle de dispositivos.

### 1. Tabela `sessoes_ativas`

Registra as sessões ativas de cada token com seu fingerprint.

**Arquivo SQL:** `database/sessoes_ativas.sql`

```sql
CREATE TABLE sessoes_ativas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) NOT NULL UNIQUE,
  fingerprint_id TEXT NOT NULL,
  ultima_atividade TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Propósito:**
- Rastrear qual fingerprint está usando cada token
- Validar se a sessão é a mesma ao fazer requisições periódicas
- Detectar quando outro dispositivo faz login com o mesmo token (fingerprint diferente)

---

### 2. Tabela `historico_dispositivos`

Registra todos os dispositivos (fingerprints) que já usaram cada token.

**Arquivo SQL:** `database/historico_dispositivos.sql`

```sql
CREATE TABLE historico_dispositivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) NOT NULL,
  fingerprint_id TEXT NOT NULL,
  primeiro_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  bloqueado_ate TIMESTAMP,
  motivo_bloqueio VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(token, fingerprint_id)
);
```

**Propósito:**
- Contar quantos dispositivos diferentes já usaram cada token
- Implementar limite de 3 dispositivos por token
- Bloquear novos dispositivos por 15 dias quando limite é atingido
- Armazenar data de desbloqueio no banco (impossível burlar mudando hora do celular)

**Regra de Negócio:**
- Máximo 3 dispositivos diferentes por token
- Se tentar logar em 4º dispositivo: bloqueia por 15 dias
- Data de desbloqueio é calculada no servidor (não no cliente)

---

### 3. Tabela `tentativas_bloqueadas` (Auditoria)

Registra tentativas de login bloqueadas para auditoria.

**Arquivo SQL:** `database/historico_dispositivos.sql`

```sql
CREATE TABLE tentativas_bloqueadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) NOT NULL,
  fingerprint_id TEXT NOT NULL,
  data_tentativa TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  motivo VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Propósito:**
- Registrar tentativas de login que foram bloqueadas
- Permitir auditoria e análise de padrões de uso

---

## Passos para Configurar no Supabase

1. **Acesse o Supabase Dashboard**
   - URL: https://app.supabase.com
   - Projeto: `rqkbsgxjjdphnjaznhiw`

2. **Execute os Scripts SQL**
   - Vá para: SQL Editor → New Query
   - Copie o conteúdo de `database/sessoes_ativas.sql` e execute
   - Copie o conteúdo de `database/historico_dispositivos.sql` e execute

3. **Verifique as Tabelas**
   - Vá para: Table Editor
   - Confirme que as 3 tabelas foram criadas:
     - `sessoes_ativas`
     - `historico_dispositivos`
     - `tentativas_bloqueadas`

4. **Configure Permissões (RLS)**
   - Selecione cada tabela
   - Ative "Enable RLS" se necessário
   - Configure políticas de acesso (anon role pode ler/escrever)

---

## Fluxo de Autenticação

### Login (handleTokenLogin)

1. Valida token (expiração)
2. **Valida novo dispositivo** (limite de 3)
   - Se 4º dispositivo: bloqueia por 15 dias
   - Mensagem: "Limite de 3 dispositivos atingido. Este token está bloqueado para novos aparelhos até [DATA]."
3. Registra sessão em `sessoes_ativas`
4. Registra dispositivo em `historico_dispositivos`

### Validação Periódica (a cada 10 segundos)

1. Valida expiração do token
2. Valida fingerprint em `sessoes_ativas`
   - Se diferente: desconecta com "Sua sessão foi encerrada porque este token foi usado em outro dispositivo."

---

## Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://rqkbsgxjjdphnjaznhiw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxa2JzZ3hqamRwaG5qYXpuaGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NTc5MzgsImV4cCI6MjA4NTQzMzkzOH0.3YrC_Zbdeu6VglzcSqWYCUMlJ0bMnt0gpD_VTv2GzCg
```

---

## Testes Recomendados

1. **Teste de Limite de Dispositivos**
   - Abra em 3 navegadores diferentes
   - Faça login com o mesmo token em todos
   - Tente logar em um 4º navegador
   - Verifique se recebe mensagem de bloqueio com data de desbloqueio

2. **Teste de Desbloqueio Automático**
   - Aguarde 15 dias (ou modifique data no banco para teste)
   - Tente logar novamente
   - Verifique se consegue acessar

3. **Teste de Kick-out**
   - Abra em 2 navegadores
   - Faça login com o mesmo token em ambos
   - O primeiro deve ser desconectado automaticamente

---

## Referências

- Documentação Supabase: https://supabase.com/docs
- Arquivo de Autenticação: `src/lib/auth.ts`
- Arquivo de Supabase: `src/lib/supabase.ts`
- Componente Principal: `src/pages/Home.tsx`
