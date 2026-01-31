# Guia de Setup do Supabase - Trava de Dispositivos

## 🚨 URGENTE: Criar as Tabelas

O sistema de bloqueio de dispositivos precisa de 2 tabelas no Supabase. Siga este guia **AGORA** para criar.

---

## ✅ Passo 1: Acessar o Supabase Dashboard

1. Abra: https://app.supabase.com
2. Faça login com suas credenciais
3. Selecione o projeto: **rqkbsgxjjdphnjaznhiw** (Calculadora 3D PRO)

---

## ✅ Passo 2: Abrir o SQL Editor

1. No menu esquerdo, clique em **"SQL Editor"**
2. Clique em **"New Query"** (botão azul no canto superior direito)
3. Uma janela em branco vai abrir para você digitar SQL

---

## ✅ Passo 3: Copiar e Colar o SQL

1. Abra o arquivo: `database/create-tables-public.sql`
2. Copie **TODO** o conteúdo
3. Cole na janela do SQL Editor
4. Clique em **"Run"** (botão azul no canto inferior direito)

**Resultado esperado:**
```
✅ historico_dispositivos - Criada com sucesso!
✅ tentativas_bloqueadas - Criada com sucesso!
```

---

## ✅ Passo 4: Verificar as Tabelas

1. No menu esquerdo, clique em **"Table Editor"**
2. Você deve ver as 2 novas tabelas:
   - `historico_dispositivos`
   - `tentativas_bloqueadas`

Se não aparecerem, recarregue a página (F5).

---

## ✅ Passo 5: Verificar Permissões

1. Clique em `historico_dispositivos`
2. Vá para a aba **"RLS"** (Row Level Security)
3. Verifique se está **DESATIVADO** (botão cinzento)

**Se estiver ATIVADO:**
1. Clique no botão de toggle para DESATIVAR
2. Confirme a ação

Repita para `tentativas_bloqueadas`.

---

## 🔍 Verificação de Conectividade

Após criar as tabelas, teste a conexão:

### Opção 1: Executar Script Node.js

```bash
cd /home/ubuntu/calculadora-3d-pro
node setup-supabase-tables.mjs
```

**Resultado esperado:**
```
✅ Conectado ao Supabase com sucesso!
✅ Tabela historico_dispositivos existe e está funcionando!
✅ Tabela tentativas_bloqueadas existe e está funcionando!
```

### Opção 2: Testar no Navegador

1. Abra a calculadora: https://seu-dominio.manus.space
2. Abra DevTools (F12)
3. Vá para a aba **"Console"**
4. Tente fazer login com um token
5. Procure por logs `[SUPABASE]`:
   - `✅ Sessão criada`
   - `✅ Dispositivo registrado`

Se ver erros, procure por `[SUPABASE] Erro ao buscar dispositivos:` e veja a mensagem de erro.

---

## 🛠️ Solução de Problemas

### Problema: "Table not found" ou "does not exist"

**Causa:** Tabelas não foram criadas

**Solução:**
1. Volte ao Passo 3 e execute o SQL novamente
2. Verifique se o SQL foi copiado completamente
3. Clique em "Run" e aguarde a execução

### Problema: "Invalid API Key"

**Causa:** Chaves do Supabase incorretas

**Solução:**
1. Verifique em `src/lib/supabase.ts`:
   - `SUPABASE_URL` = `https://rqkbsgxjjdphnjaznhiw.supabase.co`
   - `SUPABASE_ANON_KEY` = começa com `eyJhbGc...`
2. Se estiverem diferentes, atualize com as chaves corretas

### Problema: "Permission denied" ou "PERMISSION_DENIED"

**Causa:** RLS está ativado e bloqueando acesso

**Solução:**
1. Vá para Table Editor
2. Clique em `historico_dispositivos`
3. Vá para aba "RLS"
4. Clique no toggle para DESATIVAR RLS
5. Repita para `tentativas_bloqueadas`

### Problema: Tabelas criadas mas não aparecem no Table Editor

**Solução:**
1. Recarregue a página do Supabase (F5)
2. Ou clique em "Refresh" se houver botão

---

## 📊 Estrutura das Tabelas

### historico_dispositivos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária |
| `token` | VARCHAR(255) | Token de acesso |
| `fingerprint_id` | TEXT | ID único do dispositivo |
| `primeiro_acesso` | TIMESTAMP | Quando o dispositivo primeiro acessou |
| `ultimo_acesso` | TIMESTAMP | Último acesso do dispositivo |
| `bloqueado_ate` | TIMESTAMP | Data até quando está bloqueado (NULL = não bloqueado) |
| `motivo_bloqueio` | VARCHAR(255) | Motivo do bloqueio |
| `created_at` | TIMESTAMP | Quando o registro foi criado |

**Índices:**
- `idx_token_historico` - Para buscar rápido por token
- `idx_fingerprint_historico` - Para buscar rápido por fingerprint
- `idx_bloqueado_ate` - Para buscar tokens bloqueados

**Constraint:**
- `UNIQUE(token, fingerprint_id)` - Um registro por token+fingerprint

---

### tentativas_bloqueadas

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária |
| `token` | VARCHAR(255) | Token que tentou logar |
| `fingerprint_id` | TEXT | ID do dispositivo que tentou |
| `data_tentativa` | TIMESTAMP | Quando foi a tentativa |
| `motivo` | VARCHAR(255) | Motivo do bloqueio |
| `created_at` | TIMESTAMP | Quando o registro foi criado |

**Índices:**
- `idx_token_tentativas` - Para buscar por token
- `idx_data_tentativa` - Para buscar por data

---

## 🔐 Segurança

### Fase 1: Teste (ATUAL)

- RLS **DESATIVADO** (público)
- Qualquer pessoa pode ler/escrever
- **Apenas para testes!**

### Fase 2: Produção (FUTURO)

- RLS **ATIVADO**
- Políticas de segurança apropriadas
- Apenas a aplicação pode acessar

**Para ativar RLS em produção:**
1. Vá para Table Editor
2. Clique em `historico_dispositivos`
3. Vá para aba "RLS"
4. Clique no toggle para ATIVAR RLS
5. Crie políticas de segurança

---

## 📝 Checklist de Setup

- [ ] Acessei o Supabase Dashboard
- [ ] Abri o SQL Editor
- [ ] Copiei e colei o SQL de `database/create-tables-public.sql`
- [ ] Executei o SQL (cliquei em "Run")
- [ ] Verifiquei que as tabelas foram criadas em "Table Editor"
- [ ] Verifiquei que RLS está DESATIVADO em ambas as tabelas
- [ ] Testei a conexão (node setup-supabase-tables.mjs ou no navegador)
- [ ] Consegui fazer login e ver logs `[SUPABASE]` no console

---

## 🚀 Próximos Passos

Após completar este setup:

1. **Testar o bloqueio de dispositivos:**
   - Abra em 3 navegadores diferentes
   - Faça login com o mesmo token em todos
   - Tente logar em um 4º navegador
   - Você deve ver mensagem de bloqueio

2. **Monitorar logs:**
   - Abra DevTools (F12)
   - Vá para Console
   - Procure por `[SUPABASE]` para ver o que está acontecendo

3. **Implementar RLS em produção:**
   - Ativar RLS nas tabelas
   - Criar políticas de segurança apropriadas
   - Testar novamente

---

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs no console (F12 → Console)
2. Procure por `[SUPABASE] Erro` para ver a mensagem de erro real
3. Verifique se as tabelas existem em "Table Editor"
4. Verifique se RLS está desativado

---

## 📚 Referências

- **Arquivo SQL:** `database/create-tables-public.sql`
- **Script de teste:** `setup-supabase-tables.mjs`
- **Código Supabase:** `src/lib/supabase.ts`
- **Documentação Supabase:** https://supabase.com/docs
