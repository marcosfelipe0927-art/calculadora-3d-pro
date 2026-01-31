import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rqkbsgxjjdphnjaznhiw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxa2JzZ3hqamRwaG5qYXpuaGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NTc5MzgsImV4cCI6MjA4NTQzMzkzOH0.3YrC_Zbdeu6VglzcSqWYCUMlJ0bMnt0gpD_VTv2GzCg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SessaoAtiva {
  id?: string;
  token: string;
  fingerprint_id: string;
  ultima_atividade: string;
  created_at?: string;
}

// Função para registrar uma nova sessão
export async function registrarSessao(token: string, fingerprintId: string): Promise<SessaoAtiva | null> {
  try {
    // Primeiro, verifica se já existe uma sessão para este token
    const { data: sessaoExistente, error: erroLeitura } = await supabase
      .from('sessoes_ativas')
      .select('*')
      .eq('token', token)
      .single();

    if (erroLeitura && erroLeitura.code !== 'PGRST116') {
      console.error('[SUPABASE] Erro ao verificar sessão existente:', {
        code: erroLeitura.code,
        message: erroLeitura.message,
        details: erroLeitura.details,
        hint: erroLeitura.hint
      });
      return null;
    }

    // Se existe uma sessão com fingerprint diferente, a sobrescreve
    if (sessaoExistente) {
      const { data, error } = await supabase
        .from('sessoes_ativas')
        .update({
          fingerprint_id: fingerprintId,
          ultima_atividade: new Date().toISOString(),
        })
        .eq('token', token)
        .select()
        .single();

      if (error) {
        console.error('[SUPABASE] Erro ao atualizar sessão:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return null;
      }

      console.log('[SUPABASE] Sessão atualizada:', data);
      return data;
    }

    // Se não existe, cria uma nova
    const { data, error } = await supabase
      .from('sessoes_ativas')
      .insert({
        token,
        fingerprint_id: fingerprintId,
        ultima_atividade: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[SUPABASE] Erro ao criar sessão:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return null;
    }

    console.log('[SUPABASE] Sessão criada:', data);
    return data;
  } catch (err) {
    console.error('[SUPABASE] Erro inesperado ao registrar sessão:', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    return null;
  }
}

// Função para validar se a sessão é válida para este dispositivo
export async function validarSessao(token: string, fingerprintId: string): Promise<{ valida: boolean; motivo?: string }> {
  try {
    // Primeiro, importar a função de validação de token para verificar expiração
    const { isTokenValid } = await import('./auth');
    
    // Verificar se o token expirou
    const validacaoToken = isTokenValid(token);
    if (!validacaoToken.valido) {
      return { valida: false, motivo: validacaoToken.motivo || 'Token expirado' };
    }

    const { data: sessao, error } = await supabase
      .from('sessoes_ativas')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhuma sessão encontrada
        return { valida: false, motivo: 'Sessão não encontrada' };
      }
      console.error('[SUPABASE] Erro ao validar sessão:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return { valida: false, motivo: 'Erro ao validar sessão' };
    }

    // Se o fingerprint é diferente, a sessão é inválida
    if (sessao.fingerprint_id !== fingerprintId) {
      console.log('[SUPABASE] Fingerprint diferente. Sessão inválida.');
      return {
        valida: false,
        motivo: 'Sua sessão foi encerrada porque este token foi usado em outro dispositivo.',
      };
    }

    // Atualiza a última atividade
    await supabase
      .from('sessoes_ativas')
      .update({ ultima_atividade: new Date().toISOString() })
      .eq('token', token);

    return { valida: true };
  } catch (err) {
    console.error('[SUPABASE] Erro inesperado ao validar sessão:', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    return { valida: false, motivo: 'Erro ao validar sessão' };
  }
}

// Função para encerrar uma sessão
export async function encerrarSessao(token: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('sessoes_ativas')
      .delete()
      .eq('token', token);

    if (error) {
      console.error('[SUPABASE] Erro ao encerrar sessão:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return false;
    }

    console.log('[SUPABASE] Sessão encerrada');
    return true;
  } catch (err) {
    console.error('[SUPABASE] Erro inesperado ao encerrar sessão:', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    return false;
  }
}

// Função para validar se o token pode logar em um novo dispositivo
export async function validarNovoDispositivo(token: string, fingerprintId: string): Promise<{ permitido: boolean; motivo?: string; bloqueadoAte?: string }> {
  try {
    // Buscar todos os dispositivos já usados com este token
    const { data: dispositivos, error: erroLeitura } = await supabase
      .from('historico_dispositivos')
      .select('*')
      .eq('token', token);

    if (erroLeitura) {
      console.error('[SUPABASE] Erro ao buscar dispositivos:', {
        code: erroLeitura.code,
        message: erroLeitura.message,
        details: erroLeitura.details,
        hint: erroLeitura.hint
      });
      return { permitido: false, motivo: 'Erro ao validar dispositivo' };
    }

    // Verificar se o token está bloqueado
    if (dispositivos && dispositivos.length > 0) {
      const primeiroDispositivo = dispositivos[0];
      if (primeiroDispositivo.bloqueado_ate) {
        const bloqueadoAte = new Date(primeiroDispositivo.bloqueado_ate);
        const agora = new Date();
        
        if (agora < bloqueadoAte) {
          // Token ainda está bloqueado
          const dataFormatada = bloqueadoAte.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          
          console.log('[SUPABASE] Token bloqueado até:', dataFormatada);
          return {
            permitido: false,
            motivo: `Limite de 3 dispositivos atingido. Este token está bloqueado para novos aparelhos até ${dataFormatada}.`,
            bloqueadoAte: bloqueadoAte.toISOString()
          };
        }
      }
    }

    // Verificar se este fingerprint já foi usado
    const dispositivoExistente = dispositivos?.find(d => d.fingerprint_id === fingerprintId);
    if (dispositivoExistente) {
      // Atualizar último acesso
      await supabase
        .from('historico_dispositivos')
        .update({ ultimo_acesso: new Date().toISOString() })
        .eq('id', dispositivoExistente.id);
      
      return { permitido: true };
    }

    // Contar quantos dispositivos diferentes já usaram este token
    const quantidadeDispositivos = dispositivos?.length || 0;

    if (quantidadeDispositivos >= 3) {
      // Já tem 3 dispositivos, bloquear para novos
      const bloqueadoAte = new Date();
      bloqueadoAte.setDate(bloqueadoAte.getDate() + 15); // Bloquear por 15 dias

      // Atualizar todos os registros deste token com bloqueado_ate
      await supabase
        .from('historico_dispositivos')
        .update({
          bloqueado_ate: bloqueadoAte.toISOString(),
          motivo_bloqueio: 'Limite de 3 dispositivos atingido'
        })
        .eq('token', token);

      // Registrar tentativa bloqueada
      await supabase
        .from('tentativas_bloqueadas')
        .insert({
          token,
          fingerprint_id: fingerprintId,
          motivo: 'Limite de 3 dispositivos atingido'
        });

      const dataFormatada = bloqueadoAte.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return {
        permitido: false,
        motivo: `Limite de 3 dispositivos atingido. Este token está bloqueado para novos aparelhos até ${dataFormatada}.`,
        bloqueadoAte: bloqueadoAte.toISOString()
      };
    }

    // Permitir login e registrar novo dispositivo
    return { permitido: true };
  } catch (err) {
    console.error('[SUPABASE] Erro inesperado ao validar dispositivo:', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    return { permitido: false, motivo: 'Erro ao validar dispositivo' };
  }
}

// Função para registrar um novo dispositivo no histórico
export async function registrarDispositivo(token: string, fingerprintId: string): Promise<boolean> {
  try {
    // Verificar se este dispositivo já foi registrado
    const { data: existente, error: erroVerificacao } = await supabase
      .from('historico_dispositivos')
      .select('*')
      .eq('token', token)
      .eq('fingerprint_id', fingerprintId)
      .single();

    if (erroVerificacao && erroVerificacao.code !== 'PGRST116') {
      console.error('[SUPABASE] Erro ao verificar dispositivo:', {
        code: erroVerificacao.code,
        message: erroVerificacao.message,
        details: erroVerificacao.details,
        hint: erroVerificacao.hint
      });
      return false;
    }

    if (existente) {
      // Dispositivo já existe, apenas atualizar último acesso
      await supabase
        .from('historico_dispositivos')
        .update({ ultimo_acesso: new Date().toISOString() })
        .eq('id', existente.id);
      
      return true;
    }

    // Registrar novo dispositivo
    const { error } = await supabase
      .from('historico_dispositivos')
      .insert({
        token,
        fingerprint_id: fingerprintId,
        primeiro_acesso: new Date().toISOString(),
        ultimo_acesso: new Date().toISOString()
      });

    if (error) {
      console.error('[SUPABASE] Erro ao registrar dispositivo:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return false;
    }

    console.log('[SUPABASE] Dispositivo registrado:', fingerprintId);
    return true;
  } catch (err) {
    console.error('[SUPABASE] Erro inesperado ao registrar dispositivo:', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    return false;
  }
}
