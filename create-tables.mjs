import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rqkbsgxjjdphnjaznhiw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxa2JzZ3hqamRwaG5qYXpuaGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NTc5MzgsImV4cCI6MjA4NTQzMzkzOH0.3YrC_Zbdeu6VglzcSqWYCUMlJ0bMnt0gpD_VTv2GzCg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔄 Conectando ao Supabase...');

// Testar conexão
try {
  const { data, error } = await supabase.from('sessoes_ativas').select('count', { count: 'exact', head: true });
  if (error) {
    console.log('⚠️ Erro ao conectar:', error.message);
  } else {
    console.log('✅ Conectado ao Supabase com sucesso!');
  }
} catch (err) {
  console.error('❌ Erro:', err.message);
}

// Tentar inserir dados de teste para criar as tabelas automaticamente
console.log('\n📝 Criando tabelas via inserts de teste...\n');

// Teste 1: Criar historico_dispositivos
try {
  console.log('1️⃣ Testando tabela historico_dispositivos...');
  const { data, error } = await supabase
    .from('historico_dispositivos')
    .insert({
      token: 'TEST_TOKEN_DELETE_ME',
      fingerprint_id: 'test_fingerprint',
      primeiro_acesso: new Date().toISOString(),
      ultimo_acesso: new Date().toISOString()
    })
    .select();

  if (error) {
    console.log('⚠️ Erro:', error.message);
    if (error.message.includes('relation') || error.message.includes('does not exist')) {
      console.log('❌ Tabela historico_dispositivos não existe. Você precisa criar manualmente.');
    }
  } else {
    console.log('✅ Tabela historico_dispositivos criada/testada com sucesso!');
    // Deletar o registro de teste
    if (data && data[0]) {
      await supabase.from('historico_dispositivos').delete().eq('id', data[0].id);
      console.log('🗑️ Registro de teste deletado');
    }
  }
} catch (err) {
  console.error('❌ Erro ao testar historico_dispositivos:', err.message);
}

// Teste 2: Criar tentativas_bloqueadas
try {
  console.log('\n2️⃣ Testando tabela tentativas_bloqueadas...');
  const { data, error } = await supabase
    .from('tentativas_bloqueadas')
    .insert({
      token: 'TEST_TOKEN_DELETE_ME',
      fingerprint_id: 'test_fingerprint',
      motivo: 'test'
    })
    .select();

  if (error) {
    console.log('⚠️ Erro:', error.message);
    if (error.message.includes('relation') || error.message.includes('does not exist')) {
      console.log('❌ Tabela tentativas_bloqueadas não existe. Você precisa criar manualmente.');
    }
  } else {
    console.log('✅ Tabela tentativas_bloqueadas criada/testada com sucesso!');
    // Deletar o registro de teste
    if (data && data[0]) {
      await supabase.from('tentativas_bloqueadas').delete().eq('id', data[0].id);
      console.log('🗑️ Registro de teste deletado');
    }
  }
} catch (err) {
  console.error('❌ Erro ao testar tentativas_bloqueadas:', err.message);
}

console.log('\n✅ Verificação concluída!');
console.log('\n📌 Se as tabelas não existem, execute manualmente no Supabase SQL Editor:');
console.log('   1. Vá para: https://app.supabase.com → SQL Editor → New Query');
console.log('   2. Cole o conteúdo de: database/historico_dispositivos.sql');
console.log('   3. Execute a query');
