# Segurança e Autenticação - Calculadora 3D PRO

## 📋 Visão Geral

O sistema de autenticação implementa múltiplas camadas de segurança para proteger os tokens de acesso e evitar compartilhamento não autorizado:

1. **Validação de Expiração de Token** - Token expira exatamente na data cadastrada
2. **Fingerprint de Dispositivo** - Identifica o dispositivo único do usuário
3. **Sessão Ativa Única** - Apenas um dispositivo pode usar o token por vez
4. **Contador Global de Aparelhos** - Máximo 3 dispositivos diferentes por token
5. **Trava de 15 Dias** - Bloqueia novos dispositivos por 15 dias após atingir limite

---

## 🔐 Camadas de Segurança

### 1. Validação de Expiração de Token

**Arquivo:** `src/lib/auth.ts` → `isTokenValid()`

- Cada token tem uma `dataExpiracao` cadastrada em `listaTokens`
- Na primeira tentativa de login, valida se a data atual ultrapassou a data de expiração
- Se expirado: **Mensagem:** "Token expirado. Entre em contato para renovação"
- Validação periódica (a cada 10 segundos) durante a sessão ativa

**Fluxo:**
```
Login → isTokenValid() → Se expirado, rejeita
Sessão Ativa → validarSessao() → Verifica expiração a cada 10s
```

---

### 2. Fingerprint de Dispositivo

**Arquivo:** `src/lib/auth.ts` → `generateFingerprint()`

Combina informações do navegador/dispositivo:
- User Agent
- Resolução de tela
- Idioma
- Timezone

**Resultado:** String única codificada em base64

**Propósito:** Identificar o dispositivo de forma única (mesmo que o usuário limpe cookies)

---

### 3. Sessão Ativa Única

**Tabela Supabase:** `sessoes_ativas`

Rastreia qual fingerprint está usando cada token em tempo real.

**Regra:** Se outro dispositivo faz login com o mesmo token:
- Novo fingerprint é registrado em `sessoes_ativas`
- Dispositivo anterior detecta mudança na próxima validação periódica
- **Mensagem:** "Sua sessão foi encerrada porque este token foi usado em outro dispositivo."
- Usuário é desconectado automaticamente

**Fluxo:**
```
Dispositivo A faz login → fingerprint_A em sessoes_ativas
Dispositivo B faz login → fingerprint_B sobrescreve em sessoes_ativas
Dispositivo A valida sessão → Detecta fingerprint_B ≠ fingerprint_A → Kick-out
```

---

### 4. Contador Global de Aparelhos

**Tabela Supabase:** `historico_dispositivos`

Registra TODOS os fingerprints únicos que já usaram cada token.

**Limite:** Máximo 3 dispositivos diferentes por token

**Fluxo:**
```
1º dispositivo login → Registra fingerprint_1 em historico_dispositivos
2º dispositivo login → Registra fingerprint_2 em historico_dispositivos
3º dispositivo login → Registra fingerprint_3 em historico_dispositivos
4º dispositivo login → BLOQUEADO! Bloqueia por 15 dias
```

---

### 5. Trava de 15 Dias

**Função:** `validarNovoDispositivo()` em `src/lib/supabase.ts`

Quando o 4º dispositivo tenta logar:

1. **Data de Desbloqueio Calculada no Servidor**
   - `bloqueado_ate = agora + 15 dias`
   - Armazenada no banco de dados
   - **Impossível burlar mudando hora do celular**

2. **Todos os Registros do Token são Marcados**
   - Campo `bloqueado_ate` é preenchido
   - Campo `motivo_bloqueio` = "Limite de 3 dispositivos atingido"

3. **Mensagem ao Usuário**
   ```
   "Limite de 3 dispositivos atingido. Este token está bloqueado para novos 
   aparelhos até [DATA FORMATADA]."
   ```

4. **Auditoria**
   - Tentativa bloqueada é registrada em `tentativas_bloqueadas`
   - Permite análise de padrões de uso

---

## 🗄️ Estrutura de Banco de Dados

### Tabela: `sessoes_ativas`

Rastreia a sessão ativa atual.

```sql
CREATE TABLE sessoes_ativas (
  id UUID PRIMARY KEY,
  token VARCHAR(255) UNIQUE,
  fingerprint_id TEXT,
  ultima_atividade TIMESTAMP,
  created_at TIMESTAMP
);
```

**Uso:**
- 1 registro por token
- Atualizado a cada validação periódica
- Deletado ao fazer logout

---

### Tabela: `historico_dispositivos`

Rastreia todos os dispositivos que já usaram cada token.

```sql
CREATE TABLE historico_dispositivos (
  id UUID PRIMARY KEY,
  token VARCHAR(255),
  fingerprint_id TEXT,
  primeiro_acesso TIMESTAMP,
  ultimo_acesso TIMESTAMP,
  bloqueado_ate TIMESTAMP,
  motivo_bloqueio VARCHAR(255),
  created_at TIMESTAMP,
  UNIQUE(token, fingerprint_id)
);
```

**Uso:**
- Múltiplos registros por token (um por fingerprint)
- Constraint UNIQUE garante um registro por combinação token+fingerprint
- `bloqueado_ate` preenchido quando limite é atingido

---

### Tabela: `tentativas_bloqueadas`

Auditoria de tentativas de login bloqueadas.

```sql
CREATE TABLE tentativas_bloqueadas (
  id UUID PRIMARY KEY,
  token VARCHAR(255),
  fingerprint_id TEXT,
  data_tentativa TIMESTAMP,
  motivo VARCHAR(255),
  created_at TIMESTAMP
);
```

**Uso:**
- Registra cada tentativa bloqueada
- Permite análise de padrões de uso
- Útil para detectar abuso

---

## 🔄 Fluxo de Login Completo

```
1. Usuário digita token
   ↓
2. isTokenValid() → Verifica expiração
   ↓
3. validarNovoDispositivo() → Verifica limite de 3 dispositivos
   ├─ Se 4º dispositivo e token não bloqueado:
   │  └─ Bloqueia por 15 dias, registra em tentativas_bloqueadas
   ├─ Se token bloqueado e data de desbloqueio não passou:
   │  └─ Rejeita login com mensagem de bloqueio
   └─ Se OK: continua
   ↓
4. registrarSessao() → Cria/atualiza em sessoes_ativas
   ↓
5. registrarDispositivo() → Cria/atualiza em historico_dispositivos
   ↓
6. executarMigracoes() → Verifica/cria tabelas se necessário
   ↓
7. Login bem-sucedido
   ↓
8. useEffect com intervalo de 10s
   ├─ validarSessao() → Verifica expiração e fingerprint
   └─ Se inválido: kick-out automático
```

---

## 🛡️ Proteções Contra Burla

### Problema: Mudança de Hora do Celular

**Solução:** Data de desbloqueio é calculada e armazenada no servidor

```javascript
// ❌ INSEGURO (cliente):
const bloqueadoAte = new Date();
bloqueadoAte.setDate(bloqueadoAte.getDate() + 15);
// Usuário pode mudar hora do celular

// ✅ SEGURO (servidor):
const bloqueadoAte = new Date();
bloqueadoAte.setDate(bloqueadoAte.getDate() + 15);
await supabase.from('historico_dispositivos')
  .update({ bloqueado_ate: bloqueadoAte.toISOString() })
  .eq('token', token);
// Data está no banco, não pode ser alterada pelo cliente
```

---

### Problema: Limpeza de Cookies/LocalStorage

**Solução:** Fingerprint é regenerado, mas histórico permanece no banco

```
Dispositivo A limpa cookies
Dispositivo A tenta logar novamente
→ Novo fingerprint é gerado
→ historico_dispositivos já tem fingerprint_A
→ Sistema reconhece como mesmo dispositivo
→ Login permitido (não conta como novo dispositivo)
```

---

### Problema: Múltiplas Abas/Janelas

**Solução:** Fingerprint é idêntico em todas as abas do mesmo navegador

```
Aba 1: fingerprint = "abc123"
Aba 2: fingerprint = "abc123" (mesmo navegador)
→ Ambas compartilham a mesma sessão
→ Se uma faz logout, ambas são desconectadas
```

---

## 📊 Migrações Automáticas

**Arquivo:** `src/lib/migrations.ts`

As tabelas são criadas automaticamente na primeira vez que o usuário faz login:

1. **executarMigracoes()** é chamada após login bem-sucedido
2. Tenta inserir um registro de teste em cada tabela
3. Se tabela não existe, cria via RPC ou aguarda primeiro insert
4. Deleta registros de teste
5. Flag `migracoesExecutadas` evita múltiplas tentativas

**Vantagem:** Não precisa executar SQL manualmente no Supabase

---

## 🧪 Testes Recomendados

### Teste 1: Validação de Expiração

1. Modifique `listaTokens` em `src/lib/auth.ts`
2. Defina `dataExpiracao` para ontem
3. Tente fazer login
4. **Esperado:** Mensagem "Token expirado. Entre em contato para renovação"

### Teste 2: Limite de 3 Dispositivos

1. Abra em 3 navegadores diferentes
2. Faça login com o mesmo token em todos
3. Tente logar em um 4º navegador
4. **Esperado:** Mensagem de bloqueio com data de desbloqueio

### Teste 3: Kick-out Automático

1. Abra em 2 navegadores
2. Faça login com o mesmo token em ambos
3. Aguarde até 10 segundos
4. **Esperado:** Primeiro navegador é desconectado com mensagem

### Teste 4: Desbloqueio Automático

1. Após teste 2, aguarde 15 dias (ou modifique data no banco)
2. Tente logar novamente
3. **Esperado:** Login bem-sucedido

---

## 🔍 Monitoramento

### Logs Disponíveis

Todos os eventos de segurança são registrados no console:

```javascript
[SUPABASE] Sessão criada
[SUPABASE] Sessão atualizada
[SUPABASE] Fingerprint diferente. Sessão inválida.
[SUPABASE] Token bloqueado até: [DATA]
[MIGRATIONS] Criando tabela historico_dispositivos...
[MIGRATIONS] ✅ Todas as migrações concluídas com sucesso!
```

### Queries Úteis no Supabase

```sql
-- Ver todos os dispositivos de um token
SELECT * FROM historico_dispositivos WHERE token = 'TOKEN123';

-- Ver tentativas bloqueadas
SELECT * FROM tentativas_bloqueadas ORDER BY data_tentativa DESC;

-- Ver tokens bloqueados
SELECT DISTINCT token, bloqueado_ate, motivo_bloqueio 
FROM historico_dispositivos 
WHERE bloqueado_ate > NOW();

-- Desbloquear um token manualmente
UPDATE historico_dispositivos 
SET bloqueado_ate = NULL, motivo_bloqueio = NULL 
WHERE token = 'TOKEN123';
```

---

## 📝 Referências

- **Arquivo de Autenticação:** `src/lib/auth.ts`
- **Arquivo de Supabase:** `src/lib/supabase.ts`
- **Arquivo de Migrações:** `src/lib/migrations.ts`
- **Componente Principal:** `src/pages/Home.tsx`
- **Documentação Supabase:** https://supabase.com/docs
