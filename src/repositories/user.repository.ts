import { getSupabase } from '../config/supabase.js';
import { User, RegisterDTO, LoginDTO, AuthSession } from '../types/index.js';

export interface IUserRepository {
  register(data: RegisterDTO): Promise<AuthSession>;
  login(data: LoginDTO): Promise<AuthSession>;
  findById(id: string): Promise<User | null>;
}

// Memoria volátil para desarrollo offline si las credenciales de Supabase aún no se configuran
const IN_MEMORY_USERS: Map<string, { user: User; passwordHash: string }> = new Map();

export class SupabaseUserRepository implements IUserRepository {
  public async register(data: RegisterDTO): Promise<AuthSession> {
    const supabase = getSupabase();
    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`;

    if (supabase) {
      // 1. Registro mediante Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            full_name: fullName,
          },
        },
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Error al registrar usuario en Supabase Auth');
      }

      const userId = authData.user.id;
      const createdUser: User = {
        id: userId,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName,
        email: data.email,
        role: 'member',
        createdAt: new Date(authData.user.created_at || Date.now()),
      };

      // 2. Persistencia en tabla de perfiles 'profiles' si existe
      try {
        await supabase.from('profiles').upsert({
          id: userId,
          first_name: data.firstName,
          last_name: data.lastName,
          full_name: fullName,
          email: data.email,
          role: 'member',
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Nota: tabla profiles no encontrada o sin permisos, perfil guardado en metadata de auth.');
      }

      return {
        user: createdUser,
        token: authData.session?.access_token || `token-sb-${userId}`,
      };
    }

    // Modo desarrollo / offline fallback
    if (IN_MEMORY_USERS.has(data.email.toLowerCase())) {
      throw new Error('El correo electrónico ya se encuentra registrado');
    }

    const mockId = `usr_${Date.now()}`;
    const newUser: User = {
      id: mockId,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName,
      email: data.email.toLowerCase(),
      role: 'member',
      createdAt: new Date(),
    };

    IN_MEMORY_USERS.set(data.email.toLowerCase(), {
      user: newUser,
      passwordHash: data.password, // En producción real se delega a Supabase Auth
    });

    return {
      user: newUser,
      token: `aurum_jwt_${mockId}_${Date.now()}`,
    };
  }

  public async login(data: LoginDTO): Promise<AuthSession> {
    const supabase = getSupabase();

    if (supabase) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Credenciales de acceso incorrectas');
      }

      const meta = authData.user.user_metadata || {};
      const firstName = meta.first_name || 'Atleta';
      const lastName = meta.last_name || 'Gold';

      const user: User = {
        id: authData.user.id,
        firstName,
        lastName,
        fullName: meta.full_name || `${firstName} ${lastName}`,
        email: authData.user.email || data.email,
        role: (meta.role as User['role']) || 'member',
        createdAt: new Date(authData.user.created_at || Date.now()),
      };

      return {
        user,
        token: authData.session?.access_token || `token-sb-${user.id}`,
      };
    }

    // Modo desarrollo / fallback
    const record = IN_MEMORY_USERS.get(data.email.toLowerCase());
    if (!record || record.passwordHash !== data.password) {
      throw new Error('Correo electrónico o contraseña incorrectos');
    }

    return {
      user: record.user,
      token: `aurum_jwt_${record.user.id}_${Date.now()}`,
    };
  }

  public async findById(id: string): Promise<User | null> {
    const supabase = getSupabase();
    if (supabase) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (profile) {
        return {
          id: profile.id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          fullName: profile.full_name,
          email: profile.email,
          role: profile.role || 'member',
          createdAt: new Date(profile.created_at),
        };
      }
    }

    for (const entry of IN_MEMORY_USERS.values()) {
      if (entry.user.id === id) return entry.user;
    }
    return null;
  }
}

export const userRepository = new SupabaseUserRepository();
