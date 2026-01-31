#!/usr/bin/env node

/**
 * Script para criar tabelas no Supabase com RLS desativado
 * Executa via: node setup-supabase-tables.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rqkbsgxjjdphnjaznhiw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxa2JzZ3hqamRwaG5qYXpuaGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NTc5MzgsImV4cCI6MjA4NTQzMzkzOH0.3YrC_Zbdeu6VglzcSqWYCUMlJ0bMnt0gpD_VTv2GzCg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔄 Conectando ao Supabase...\n');

/**
 * Testa a conexão com o Supabase
 */
async function testarConexao() {
  try {
    const { data, error } = await supabase.from('sessoes_ativas').select('count', { count: 'exact', head: true });
    
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Erro ao conectar:', {
        code: error.code,
        message: error.message,
        details: error.details
      });
      return false;
    }
    
    console.log('✅ Conectado ao Supabase com sucesso!\n');
    return true;
  } catch (err) {
    console.error('❌ Erro de conexão:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

/**
 * Tenta criar a tabela historico_dispositivos
 */
async function criarTabelaHistoricoDispositivos() {
  console.log('📝 Criando tabela historico_dispositivos...');
  
  try {
    // Tentar inserir um registro de teste
    const { data, error } = await supabase
      .from('historico_dispositivos')
      .insert({
        token: '__TEST__',
        fingerprint_id: '__TEST__',
        primeiro_acesso: new Date().toISOString(),
        ultimo_acesso: new Date().toISOString()
      })
      .select();

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('⚠️  Tabela não existe. Ela será criada automaticamente no primeiro insert durante o login.');
        console.log('   Ou você pode criar manualmente no Supabase SQL Editor com:');
        console.log('   → Vá para SQL Editor → New Query');
        console.log('   → Cole o conteúdo de database/historico_dispositivos.sql');
        return false;
      }
      
      console.error('❌ Erro ao testar tabela:', {
        code: error.code,
        message: error.message,
        details: error.details
      });
      return false;
    }

    // Se conseguiu inserir, deletar o registro de teste
    if (data && data[0]) {
      await supabase.from('historico_dispositivos').delete().eq('id', data[0].id);
      console.log('✅ Tabela historico_dispositivos existe e está funcionando!\n');
      return true;
    }
  } catch (err) {
    console.error('❌ Erro ao criar historico_dispositivos:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

/**
 * Tenta criar a tabela tentativas_bloqueadas
 */
async function criarTabelaTentativasBloqueadas() {
  console.log('📝 Criando tabela tentativas_bloqueadas...');
  
  try {
    // Tentar inserir um registro de teste
    const { data, error } = await supabase
      .from('tentativas_bloqueadas')
      .insert({
        token: '__TEST__',
        fingerprint_id: '__TEST__',
        motivo: '__TEST__'
      })
      .select();

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('⚠️  Tabela não existe. Ela será criada automaticamente no primeiro insert durante o login.');
        console.log('   Ou você pode criar manualmente no Supabase SQL Editor com:');
        console.log('   → Vá para SQL Editor → New Query');
        console.log('   → Cole o conteúdo de database/historico_dispositivos.sql');
        return false;
      }
      
      console.error('❌ Erro ao testar tabela:', {
        code: error.code,
        message: error.message,
        details: error.details
      });
      return false;
    }

    // Se conseguiu inserir, deletar o registro de teste
    if (data && data[0]) {
      await supabase.from('tentativas_bloqueadas').delete().eq('id', data[0].id);
      console.log('✅ Tabela tentativas_bloqueadas existe e está funcionando!\n');
      return true;
    }
  } catch (err) {
    console.error('❌ Erro ao criar tentativas_bloqueadas:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

/**
 * Função principal
 */
async function main() {
  // Testar conexão
  const conectado = await testarConexao();
  if (!conectado) {
    console.error('\n❌ Não foi possível conectar ao Supabase. Verifique as credenciais.');
    process.exit(1);
  }

  // Tentar criar tabelas
  const tabelaHistoricoOK = await criarTabelaHistoricoDispositivos();
  const tabelaTentativasOK = await criarTabelaTentativasBloqueadas();

  // Resumo
  console.log('\n📊 RESUMO:');
  console.log(`historico_dispositivos: ${tabelaHistoricoOK ? '✅' : '⚠️'}`);
  console.log(`tentativas_bloqueadas: ${tabelaTentativasOK ? '✅' : '⚠️'}`);

  if (!tabelaHistoricoOK || !tabelaTentativasOK) {
    console.log('\n⚠️  PRÓXIMOS PASSOS:');
    console.log('1. Abra o Supabase Dashboard: https://app.supabase.com');
    console.log('2. Vá para: SQL Editor → New Query');
    console.log('3. Cole o conteúdo de: database/historico_dispositivos.sql');
    console.log('4. Clique em "Run" para executar');
    console.log('5. As tabelas serão criadas com RLS desativado (público)');
    console.log('\n💡 Dica: As tabelas também serão criadas automaticamente no primeiro login!');
  } else {
    console.log('\n✅ Tudo pronto! As tabelas estão criadas e funcionando.');
  }
}

main().catch(err => {
  console.error('❌ Erro fatal:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
