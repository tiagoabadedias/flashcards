import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const { accessToken, user } = await this.authService.googleLogin(req);
    
    // Redireciona para o frontend com o token
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://www.explicaai.co';
    
    // Codificamos o user para passar na URL (não é o ideal para dados sensíveis, mas para nome/avatar ok)
    // O ideal seria apenas o token e o front busca o user com /me, mas vamos simplificar
    return res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
  }
}
