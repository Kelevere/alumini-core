import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ===== VALIDAÇÃO (usando validação manual, similar ao Zod) =====
interface AlunoInput {
  nome: string;
  idade: number;
  email: string;
  curso: string;
}

interface ValidationError {
  field: string;
  message: string;
}

function validateAluno(data: any): { valid: boolean; errors: ValidationError[]; data?: AlunoInput } {
  const errors: ValidationError[] = [];

  if (!data.nome || typeof data.nome !== 'string' || data.nome.trim().length === 0) {
    errors.push({ field: 'nome', message: 'Nome é obrigatório e deve ser um texto válido' });
  } else if (data.nome.trim().length > 100) {
    errors.push({ field: 'nome', message: 'Nome deve ter no máximo 100 caracteres' });
  }

  if (!data.idade || typeof data.idade !== 'number') {
    errors.push({ field: 'idade', message: 'Idade é obrigatória e deve ser um número' });
  } else if (data.idade < 1 || data.idade > 150) {
    errors.push({ field: 'idade', message: 'Idade deve estar entre 1 e 150 anos' });
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.push({ field: 'email', message: 'Email é obrigatório' });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push({ field: 'email', message: 'Email deve ser válido' });
    }
  }

  if (!data.curso || typeof data.curso !== 'string' || data.curso.trim().length === 0) {
    errors.push({ field: 'curso', message: 'Curso é obrigatório e deve ser um texto válido' });
  } else if (data.curso.trim().length > 100) {
    errors.push({ field: 'curso', message: 'Curso deve ter no máximo 100 caracteres' });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      nome: data.nome.trim(),
      idade: data.idade,
      email: data.email.trim().toLowerCase(),
      curso: data.curso.trim()
    }
  };
}

// ===== SERVICE LAYER =====
class AlunosService {
  constructor(private supabase: any) {}

  async listarTodos() {
    console.log('[Service] Listando todos os alunos');
    const { data, error } = await this.supabase
      .from('alunos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Service] Erro ao listar alunos:', error);
      throw error;
    }

    console.log(`[Service] ${data?.length || 0} alunos encontrados`);
    return data;
  }

  async buscarPorId(id: string) {
    console.log(`[Service] Buscando aluno com ID: ${id}`);
    const { data, error } = await this.supabase
      .from('alunos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[Service] Erro ao buscar aluno:', error);
      throw error;
    }

    console.log('[Service] Aluno encontrado:', data?.nome);
    return data;
  }

  async criar(alunoData: AlunoInput) {
    console.log('[Service] Criando novo aluno:', alunoData.nome);
    const { data, error } = await this.supabase
      .from('alunos')
      .insert([alunoData])
      .select()
      .single();

    if (error) {
      console.error('[Service] Erro ao criar aluno:', error);
      throw error;
    }

    console.log('[Service] Aluno criado com sucesso:', data?.id);
    return data;
  }

  async atualizar(id: string, alunoData: Partial<AlunoInput>) {
    console.log(`[Service] Atualizando aluno ID: ${id}`);
    const { data, error } = await this.supabase
      .from('alunos')
      .update(alunoData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Service] Erro ao atualizar aluno:', error);
      throw error;
    }

    console.log('[Service] Aluno atualizado com sucesso');
    return data;
  }

  async deletar(id: string) {
    console.log(`[Service] Deletando aluno ID: ${id}`);
    const { error } = await this.supabase
      .from('alunos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Service] Erro ao deletar aluno:', error);
      throw error;
    }

    console.log('[Service] Aluno deletado com sucesso');
    return true;
  }
}

// ===== CONTROLLER LAYER =====
class AlunosController {
  constructor(private service: AlunosService) {}

  async listar() {
    try {
      const alunos = await this.service.listarTodos();
      return {
        success: true,
        message: 'Alunos listados com sucesso',
        data: alunos,
        total: alunos.length
      };
    } catch (error) {
      console.error('[Controller] Erro ao listar alunos:', error);
      return {
        success: false,
        message: 'Erro ao listar alunos',
        error: (error as Error).message
      };
    }
  }

  async buscar(id: string) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'ID do aluno é obrigatório'
        };
      }

      const aluno = await this.service.buscarPorId(id);
      return {
        success: true,
        message: 'Aluno encontrado com sucesso',
        data: aluno
      };
    } catch (error) {
      console.error('[Controller] Erro ao buscar aluno:', error);
      return {
        success: false,
        message: 'Aluno não encontrado',
        error: (error as Error).message
      };
    }
  }

  async criar(body: any) {
    try {
      const validation = validateAluno(body);
      
      if (!validation.valid) {
        return {
          success: false,
          message: 'Dados inválidos',
          errors: validation.errors
        };
      }

      const aluno = await this.service.criar(validation.data!);
      return {
        success: true,
        message: 'Aluno cadastrado com sucesso',
        data: aluno
      };
    } catch (error) {
      console.error('[Controller] Erro ao criar aluno:', error);
      
      if ((error as any).message?.includes('duplicate key')) {
        return {
          success: false,
          message: 'Email já cadastrado',
          error: 'Este email já está sendo usado por outro aluno'
        };
      }

      return {
        success: false,
        message: 'Erro ao cadastrar aluno',
        error: (error as Error).message
      };
    }
  }

  async atualizar(id: string, body: any) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'ID do aluno é obrigatório'
        };
      }

      const validation = validateAluno(body);
      
      if (!validation.valid) {
        return {
          success: false,
          message: 'Dados inválidos',
          errors: validation.errors
        };
      }

      const aluno = await this.service.atualizar(id, validation.data!);
      return {
        success: true,
        message: 'Aluno atualizado com sucesso',
        data: aluno
      };
    } catch (error) {
      console.error('[Controller] Erro ao atualizar aluno:', error);
      
      if ((error as any).message?.includes('duplicate key')) {
        return {
          success: false,
          message: 'Email já cadastrado',
          error: 'Este email já está sendo usado por outro aluno'
        };
      }

      return {
        success: false,
        message: 'Erro ao atualizar aluno',
        error: (error as Error).message
      };
    }
  }

  async deletar(id: string) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'ID do aluno é obrigatório'
        };
      }

      await this.service.deletar(id);
      return {
        success: true,
        message: 'Aluno deletado com sucesso'
      };
    } catch (error) {
      console.error('[Controller] Erro ao deletar aluno:', error);
      return {
        success: false,
        message: 'Erro ao deletar aluno',
        error: (error as Error).message
      };
    }
  }
}

// ===== ROUTES =====
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`[Routes] ${req.method} ${req.url}`);

    // Inicializar Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Instanciar Service e Controller
    const service = new AlunosService(supabaseClient);
    const controller = new AlunosController(service);

    // Parse URL e método
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(p => p);
    const id = pathParts[pathParts.length - 1];

    let result;

    // Roteamento
    switch (req.method) {
      case 'GET':
        // GET /alunos-api ou GET /alunos-api/
        if (!id || id === 'alunos-api') {
          result = await controller.listar();
        } else {
          // GET /alunos-api/{id}
          result = await controller.buscar(id);
        }
        break;

      case 'POST':
        // POST /alunos-api
        const createBody = await req.json();
        result = await controller.criar(createBody);
        break;

      case 'PUT':
      case 'PATCH':
        // PUT/PATCH /alunos-api/{id}
        const updateBody = await req.json();
        result = await controller.atualizar(id, updateBody);
        break;

      case 'DELETE':
        // DELETE /alunos-api/{id}
        result = await controller.deletar(id);
        break;

      default:
        result = {
          success: false,
          message: 'Método não permitido'
        };
    }

    const status = result.success ? 200 : 400;
    
    return new Response(
      JSON.stringify(result),
      {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[Routes] Erro não tratado:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Erro interno do servidor',
        error: (error as Error).message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});