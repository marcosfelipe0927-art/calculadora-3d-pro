#!/usr/bin/env node

/**
 * Script para limpar apenas chaves de autenticação do localStorage
 * Preserva: calculadora_config, calculadora_historico, calculadora_materiais
 * Remove: auth_token, auth_fingerprint, device_history, userType (se necessário)
 * 
 * Nota: Este script é apenas para referência. O localStorage é limpado no navegador.
 */

console.log('🧹 Limpeza de Autenticação - Referência');
console.log('=====================================\n');

console.log('Chaves a REMOVER (autenticação):');
console.log('  - auth_token');
console.log('  - auth_fingerprint');
console.log('  - device_history');
console.log('  - tentativas_bloqueadas');
console.log('  - historico_dispositivos\n');

console.log('Chaves a PRESERVAR (configurações do usuário):');
console.log('  ✓ calculadora_config (máquina, estado, valores)');
console.log('  ✓ calculadora_historico (histórico de cálculos)');
console.log('  ✓ calculadora_materiais (insumos)');
console.log('  ✓ calculos_realizados (contador)');
console.log('  ✓ calculos_last_reset_date (data de reset)');
console.log('  ✓ calculos_last_reset_week (semana de reset)\n');

console.log('📝 Para limpar no navegador:');
console.log('1. Abra DevTools (F12)');
console.log('2. Vá para Application → Local Storage');
console.log('3. Remova as chaves de autenticação listadas acima');
console.log('4. Recarregue a página (F5)\n');

console.log('✅ Após limpeza, o app carregará sem exigir login!');
