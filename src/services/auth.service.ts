import { IUserRepository, userRepository } from '../repositories/user.repository.js';
import { RegisterDTO, LoginDTO, AuthSession, User } from '../types/index.js';

export class AuthService {
  private repository: IUserRepository;

  constructor(repository: IUserRepository = userRepository) {
    this.repository = repository;
  }

  public async register(dto: RegisterDTO): Promise<AuthSession> {
    const sanitizedDto: RegisterDTO = {
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: dto.email.trim().toLowerCase(),
      password: dto.password,
    };

    return await this.repository.register(sanitizedDto);
  }

  public async login(dto: LoginDTO): Promise<AuthSession> {
    const sanitizedDto: LoginDTO = {
      email: dto.email.trim().toLowerCase(),
      password: dto.password,
    };

    return await this.repository.login(sanitizedDto);
  }

  public async getProfile(userId: string): Promise<User | null> {
    return await this.repository.findById(userId);
  }
}

export const authService = new AuthService();
