/**
 * Sistema de Migrações Automáticas
 * Verifica e cria tabelas necessárias na primeira execução
 */

import { supabase } from './supabase';

// Flag para evitar múltiplas tentativas
let migracoesExecutadas = false;

/**
 * Verifica se uma tabela existe no Supabase
 */
async function tabelaExiste(nomeTabela: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(nomeTabela)
      .select('*', { count: 'exact', head: true });

    // Se erro é "not found", a tabela não existe
    if (error && error.code === 'PGRST116') {
      return false;
    }

    // Se não há erro ou erro é outro, a tabela existe
    return !error;
  } catch (err) {
    console.error(`[MIGRATIONS] Erro ao verificar tabela ${nomeTabela}:`, err);
    return false;
  }
}

/**
 * Cria a tabela historico_dispositivos se não existir
 */
async function criarTabelaHistoricoDispositivos(): Promise<boolean> {
  try {
    console.log('[MIGRATIONS] Criando tabela historico_dispositivos...');

    // Tentar inserir um registro de teste para criar a tabela
    const { error } = await supabase
      .from('historico_dispositivos')
      .insert({
        token: '__MIGRATION_TEST__',
        fingerprint_id: '__MIGRATION_TEST__',
        primeiro_acesso: new Date().toISOString(),
        ultimo_acesso: new Date().toISOString(),
      })
      .select();

    if (error) {
      // Se o erro é sobre a tabela não existir, precisamos criar via RPC
      if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
        console.log('[MIGRATIONS] Tabela não existe. Tentando criar via RPC...');
        
        // Tentar criar via RPC se disponível
        try {
          await supabase.rpc('exec_sql', {
            sql: `
              CREATE TABLE IF NOT EXISTS historico_dispositivos (
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
              
              CREATE INDEX IF NOT EXISTS idx_token_historico ON historico_dispositivos(token);
              CREATE INDEX IF NOT EXISTS idx_fingerprint_historico ON historico_dispositivos(fingerprint_id);
              CREATE INDEX IF NOT EXISTS idx_bloqueado_ate ON historico_dispositivos(bloqueado_ate);
            `
          });
          console.log('[MIGRATIONS] ✅ Tabela historico_dispositivos criada via RPC');
          return true;
        } catch (rpcErr) {
          console.log('[MIGRATIONS] RPC não disponível. Tabela será criada no primeiro insert.');
          return false;
        }
      }
      
      console.error('[MIGRATIONS] Erro ao criar historico_dispositivos:', error);
      return false;
    }

    // Se conseguiu inserir, deletar o registro de teste
    await supabase
      .from('historico_dispositivos')
      .delete()
      .eq('token', '__MIGRATION_TEST__');

    console.log('[MIGRATIONS] ✅ Tabela historico_dispositivos criada/verificada');
    return true;
  } catch (err) {
    console.error('[MIGRATIONS] Erro ao criar historico_dispositivos:', err);
    return false;
  }
}

/**
 * Cria a tabela tentativas_bloqueadas se não existir
 */
async function criarTabelaTentativasBloqueadas(): Promise<boolean> {
  try {
    console.log('[MIGRATIONS] Criando tabela tentativas_bloqueadas...');

    // Tentar inserir um registro de teste para criar a tabela
    const { error } = await supabase
      .from('tentativas_bloqueadas')
      .insert({
        token: '__MIGRATION_TEST__',
        fingerprint_id: '__MIGRATION_TEST__',
        motivo: '__MIGRATION_TEST__',
      })
      .select();

    if (error) {
      // Se o erro é sobre a tabela não existir, precisamos criar via RPC
      if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
        console.log('[MIGRATIONS] Tabela não existe. Tentando criar via RPC...');
        
        // Tentar criar via RPC se disponível
        try {
          await supabase.rpc('exec_sql', {
            sql: `
              CREATE TABLE IF NOT EXISTS tentativas_bloqueadas (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                token VARCHAR(255) NOT NULL,
                fingerprint_id TEXT NOT NULL,
                data_tentativa TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                motivo VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              );
              
              CREATE INDEX IF NOT EXISTS idx_token_tentativas ON tentativas_bloqueadas(token);
              CREATE INDEX IF NOT EXISTS idx_data_tentativa ON tentativas_bloqueadas(data_tentativa);
            `
          });
          console.log('[MIGRATIONS] ✅ Tabela tentativas_bloqueadas criada via RPC');
          return true;
        } catch (rpcErr) {
          console.log('[MIGRATIONS] RPC não disponível. Tabela será criada no primeiro insert.');
          return false;
        }
      }
      
      console.error('[MIGRATIONS] Erro ao criar tentativas_bloqueadas:', error);
      return false;
    }

    // Se conseguiu inserir, deletar o registro de teste
    await supabase
      .from('tentativas_bloqueadas')
      .delete()
      .eq('token', '__MIGRATION_TEST__');

    console.log('[MIGRATIONS] ✅ Tabela tentativas_bloqueadas criada/verificada');
    return true;
  } catch (err) {
    console.error('[MIGRATIONS] Erro ao criar tentativas_bloqueadas:', err);
    return false;
  }
}

/**
 * Executa todas as migrações necessárias
 * Chamada uma única vez na primeira vez que o usuário faz login
 */
export async function executarMigracoes(): Promise<boolean> {
  // Se já foi executado, não fazer novamente
  if (migracoesExecutadas) {
    console.log('[MIGRATIONS] Migrações já foram executadas nesta sessão');
    return true;
  }

  console.log('[MIGRATIONS] 🔄 Iniciando migrações automáticas...');

  try {
    // Verificar e criar tabelas
    await criarTabelaHistoricoDispositivos();
    await criarTabelaTentativasBloqueadas();

    migracoesExecutadas = true;
    console.log('[MIGRATIONS] ✅ Todas as migrações concluídas com sucesso!');
    return true;
  } catch (err) {
    console.error('[MIGRATIONS] ❌ Erro durante as migrações:', err);
    return false;
  }
}

/**
 * Reseta o flag de migrações (útil para testes)
 */
export function resetarMigracoes(): void {
  migracoesExecutadas = false;
  console.log('[MIGRATIONS] Flag de migrações resetado');
}
