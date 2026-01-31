# Cache Busting e Atualização de Tokens

## 📋 Visão Geral

O sistema implementa **Cache Busting** automático para garantir que os clientes sempre recebam a versão mais recente da aplicação quando há mudanças importantes, como adição de novos tokens à `listaTokens`.

---

## 🔄 Como Funciona

### 1. Versionamento da Aplicação

**Arquivo:** `package.json`

```json
{
  "name": "calculadora-3d-pro",
  "version": "1.0.1"
}
```

A versão é incrementada sempre que há mudanças que precisam ser refletidas nos clientes.

### 2. Módulo de Versão

**Arquivo:** `src/lib/version.ts`

```typescript
export const APP_VERSION = '1.0.1';

export function verificarNovaVersao(): boolean {
  const versaoArmazenada = localStorage.getItem('app_version');
  
  if (!versaoArmazenada || versaoArmazenada !== APP_VERSION) {
    localStorage.setItem('app_version', APP_VERSION);
    return true;
  }
  
  return false;
}

export function forcarAtualizacao(): void {
  if (verificarNovaVersao()) {
    // Limpar cache e recarregar
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = window.location.href + '?v=' + APP_VERSION;
  }
}
```

### 3. Integração no Componente Principal

**Arquivo:** `src/pages/Home.tsx`

```typescript
import { forcarAtualizacao } from "@/lib/version";

useEffect(() => {
  // Verificar nova versão e forçar atualização se necessário
  forcarAtualizacao();
  
  // ... resto do código
}, []);
```

---

## 🔧 Processo de Atualização de Tokens

### Passo 1: Adicionar Token à `listaTokens`

**Arquivo:** `src/lib/auth.ts`

```typescript
export const listaTokens: Record<string, { nome: string; email: string; dataExpiracao: string }> = {
  "TOKEN123": { nome: "Cliente 1", email: "cliente1@email.com", dataExpiracao: "2026-02-26" },
  "TOKEN456": { nome: "Cliente 2", email: "cliente2@email.com", dataExpiracao: "2026-03-15" },
  "TOKEN789": { nome: "Cliente 3", email: "cliente3@email.com", dataExpiracao: "2026-04-10" },
  "023F682D": { nome: "Guilherme Klayver", email: "61995956969", dataExpiracao: "2026-03-02" },
  "83B26F11": { nome: "Segurança", email: "sn", dataExpiracao: "2026-03-02" },  // ← Novo token
};
```

**Checklist:**
- ✅ Token em MAIÚSCULAS
- ✅ Vírgula após o token anterior
- ✅ Sem vírgula no último token
- ✅ Aspas duplas ao redor de chaves e valores
- ✅ `dataExpiracao` no formato `YYYY-MM-DD`

### Passo 2: Incrementar Versão

**Arquivo:** `package.json`

```json
{
  "version": "1.0.1"  // ← Incrementar de 1.0.0 para 1.0.1
}
```

**Regra de Versionamento:**
- `MAJOR.MINOR.PATCH`
- Incrementar `PATCH` para mudanças de tokens
- Incrementar `MINOR` para novas funcionalidades
- Incrementar `MAJOR` para mudanças quebradas

### Passo 3: Fazer Commit e Push para GitHub

```bash
git add src/lib/auth.ts package.json
git commit -m "Add new token 83B26F11 to listaTokens"
git push origin main
```

### Passo 4: Fazer Build

```bash
pnpm run build
```

O build gera arquivos com hash de conteúdo, garantindo que navegadores baixem novos assets.

### Passo 5: Deploy

A aplicação é deployada automaticamente via Manus.

---

## 🌐 O Que Acontece no Cliente

### Primeira Visita (Sem Cache)

```
1. Cliente acessa a aplicação
2. forcarAtualizacao() é chamada
3. localStorage.getItem('app_version') retorna null
4. Versão é armazenada no localStorage
5. Aplicação carrega normalmente
```

### Visita Subsequente (Com Cache)

```
1. Cliente acessa a aplicação
2. forcarAtualizacao() é chamada
3. localStorage.getItem('app_version') retorna "1.0.0"
4. APP_VERSION no código é "1.0.1"
5. Versões não correspondem → Nova versão detectada!
6. localStorage e sessionStorage são limpos
7. Página é recarregada com parâmetro ?v=1.0.1
8. Navegador baixa novos assets (sem cache)
9. Novo token é reconhecido
```

---

## 🛡️ Proteções Implementadas

### 1. Hash de Conteúdo nos Assets

Vite automaticamente adiciona hash aos arquivos:

```
dist/public/assets/index-CL4FBIDK.js  ← Hash único
dist/public/assets/index-DYWksW7b.css ← Hash único
```

Se o conteúdo muda, o hash muda, e o navegador baixa novo arquivo.

### 2. Query Parameter de Versão

```
https://calculadora-3d-pro.manus.space/?v=1.0.1
```

O parâmetro `?v=1.0.1` força bypass de cache HTTP.

### 3. Limpeza de Storage Local

```typescript
localStorage.clear();
sessionStorage.clear();
```

Garante que dados antigos não causem conflitos.

### 4. Service Worker Unregister

```typescript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  });
}
```

Remove service workers antigos que poderiam servir cache.

---

## 📊 Exemplo Prático: Adicionando Token "83B26F11"

### Antes (Versão 1.0.0)

**Cliente A:**
- Acessa aplicação
- localStorage: `app_version = "1.0.0"`
- Tenta logar com "83B26F11"
- **Resultado:** Token não reconhecido ❌

### Depois (Versão 1.0.1)

**Passo 1:** Adicionar token ao `auth.ts` e incrementar versão no `package.json`

**Passo 2:** Push para GitHub e deploy

**Passo 3:** Cliente A acessa novamente

```
1. forcarAtualizacao() detecta: "1.0.0" ≠ "1.0.1"
2. localStorage.clear() limpa dados antigos
3. window.location.href = "...?v=1.0.1" recarrega
4. Navegador baixa novo index-CL4FBIDK.js
5. Novo código com "83B26F11" é carregado
6. Tenta logar com "83B26F11"
7. **Resultado:** Token reconhecido ✅
```

---

## 🔍 Monitoramento

### Logs no Console

```javascript
[VERSION] Nova versão detectada: 1.0.0 → 1.0.1
[VERSION] Forçando atualização da página...
```

### Verificar Versão Armazenada

No console do navegador:

```javascript
localStorage.getItem('app_version')  // "1.0.1"
```

### Verificar Assets Baixados

Na aba Network do DevTools:

```
index-CL4FBIDK.js    ← Hash único por versão
index-DYWksW7b.css   ← Hash único por versão
```

---

## ⚠️ Problemas Comuns

### Problema: Token ainda não é reconhecido após adicionar

**Causa:** Cliente tem cache antigo

**Solução:**
1. Abrir DevTools (F12)
2. Ir para Application → Storage
3. Limpar localStorage e sessionStorage
4. Recarregar página (Ctrl+Shift+R ou Cmd+Shift+R)

### Problema: Versão não muda após push

**Causa:** Versão em `package.json` não foi incrementada

**Solução:**
```bash
# Verificar versão atual
cat package.json | grep version

# Incrementar versão
# Editar package.json e alterar "version": "1.0.0" para "1.0.1"
```

### Problema: Build falha após adicionar token

**Causa:** Erro de sintaxe em `auth.ts`

**Solução:**
```bash
# Verificar sintaxe
pnpm run check

# Ou rodar build com mais detalhes
pnpm run build
```

---

## 📝 Checklist para Adicionar Novo Token

- [ ] Abrir `src/lib/auth.ts`
- [ ] Adicionar novo token à `listaTokens` com sintaxe correta
- [ ] Verificar vírgulas e aspas
- [ ] Incrementar versão em `package.json`
- [ ] Executar `pnpm run build` para verificar erros
- [ ] Fazer commit: `git add . && git commit -m "Add token XXX"`
- [ ] Push para GitHub: `git push origin main`
- [ ] Verificar deploy no Manus
- [ ] Testar login com novo token em navegador limpo
- [ ] Verificar console para logs `[VERSION]`

---

## 🚀 Automação Futura

Possibilidades para melhorar ainda mais:

1. **Notificação de Atualização:** Mostrar banner ao usuário informando que nova versão está disponível
2. **Update Automático em Background:** Baixar nova versão sem recarregar página
3. **Rollback Automático:** Se versão nova tiver erro, voltar para versão anterior
4. **Versionamento Semântico Automático:** Incrementar versão automaticamente via CI/CD

---

## 📚 Referências

- **Arquivo de Versão:** `src/lib/version.ts`
- **Arquivo de Autenticação:** `src/lib/auth.ts`
- **Configuração:** `package.json`
- **Documentação Vite:** https://vitejs.dev/guide/
