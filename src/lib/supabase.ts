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
      console.error('[SUPABASE] Erro ao verificar sessão existente:', erroLeitura);
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
        console.error('[SUPABASE] Erro ao atualizar sessão:', error);
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
      console.error('[SUPABASE] Erro ao criar sessão:', error);
      return null;
    }

    console.log('[SUPABASE] Sessão criada:', data);
    return data;
  } catch (err) {
    console.error('[SUPABASE] Erro inesperado ao registrar sessão:', err);
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
      console.error('[SUPABASE] Erro ao validar sessão:', error);
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
    console.error('[SUPABASE] Erro inesperado ao validar sessão:', err);
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
      console.error('[SUPABASE] Erro ao encerrar sessão:', error);
      return false;
    }

    console.log('[SUPABASE] Sessão encerrada');
    return true;
  } catch (err) {
    console.error('[SUPABASE] Erro inesperado ao encerrar sessão:', err);
    return false;
  }
}
