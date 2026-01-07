import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guard/jwt.auth.guard';
import { RolesGuard } from './guard/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from './guard/roles.decorator';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    console.log(dto);
    return this.authService.login(dto);
  }

  @Post('register-admin')
  registerAdmin(
    @Body() dto: { name: string; email: string; password: string },
  ) {
    return this.authService.registerAdmin(dto);
  }
}
