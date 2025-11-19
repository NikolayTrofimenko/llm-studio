import { User } from '../../users/entities/user.entity';

export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: Pick<
    User,
    'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'emailVerified'
  >;
}

