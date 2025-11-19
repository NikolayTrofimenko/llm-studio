import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  create(data: Partial<User>) {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.usersRepository.findOne({ where: { id } });
  }

  async markEmailVerified(userId: string) {
    await this.usersRepository.update(userId, {
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });
    return this.findById(userId);
  }

  async updatePassword(userId: string, passwordHash: string) {
    await this.usersRepository.update(userId, { passwordHash });
  }
}

