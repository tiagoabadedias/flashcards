import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

const ONBOARDING_VERSION = 1;

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async me(@Req() req) {
    const userId = req.user?.userId;
    const user = await this.userService.findById(userId);

    const onboarding = user?.onboarding ?? { version: ONBOARDING_VERSION, completed: false };

    return {
      id: user?._id?.toString(),
      email: user?.email,
      name: user?.name,
      avatar: user?.avatar,
      onboarding,
    };
  }

  @Post('me/onboarding/complete')
  async completeOnboarding(@Req() req) {
    const userId = req.user?.userId;
    const user = await this.userService.completeOnboarding(userId, ONBOARDING_VERSION);

    return {
      onboarding: user?.onboarding ?? { version: ONBOARDING_VERSION, completed: true, completedAt: new Date() },
    };
  }
}

