import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async googleLogin(req) {
    if (!req.user) {
      throw new UnauthorizedException('No user from google');
    }

    // Encontra ou cria o usuário no banco
    const user = await this.userService.findOrCreate(req.user.profile);

    // Gera o JWT
    // Incluímos name e avatar no payload para facilitar o frontend (embora aumente o tamanho do token)
    const payload = { 
      email: user.email, 
      sub: user._id,
      name: user.name,
      avatar: user.avatar
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    };
  }
}
