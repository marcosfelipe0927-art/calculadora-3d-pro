/**
 * Versão da Aplicação
 * Usada para Cache Busting - força atualização quando versão muda
 */

export const APP_VERSION = '1.0.1';

/**
 * Verifica se há uma nova versão disponível
 * Compara a versão armazenada no localStorage com a versão atual
 */
export function verificarNovaVersao(): boolean {
  const versaoArmazenada = localStorage.getItem('app_version');
  
  if (!versaoArmazenada) {
    // Primeira vez que o usuário acessa
    localStorage.setItem('app_version', APP_VERSION);
    return false;
  }

  if (versaoArmazenada !== APP_VERSION) {
    // Nova versão detectada
    console.log(`[VERSION] Nova versão detectada: ${versaoArmazenada} → ${APP_VERSION}`);
    localStorage.setItem('app_version', APP_VERSION);
    return true;
  }

  return false;
}

/**
 * Força atualização da página se houver nova versão
 * Limpa cache e recarrega a página
 */
export function forcarAtualizacao(): void {
  if (verificarNovaVersao()) {
    console.log('[VERSION] Forçando atualização da página...');
    
    // Limpar cache de serviço (se houver)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });
    }

    // Limpar localStorage e sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // Recarregar página com cache bypass
    window.location.href = window.location.href + '?v=' + APP_VERSION;
  }
}

/**
 * Obtém a versão atual
 */
export function obterVersao(): string {
  return APP_VERSION;
}
