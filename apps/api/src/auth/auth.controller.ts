import { Controller, Post, Patch, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SettingsService } from '../settings/settings.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private settingsService: SettingsService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto & { baseUrl?: string }) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('google')
  @ApiOperation({ summary: 'Login or register with Google OAuth' })
  async googleLogin(@Body('token') token: string) {
    if (!token) throw new Error('Token is required');
    return this.authService.googleLogin(token);
  }

  @Public()
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email with token' })
  async verifyEmail(@Query('token') token: string) {
    if (!token) throw new Error('Token is required');
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend email verification link' })
  async resendVerification(@Body() body: { email: string; baseUrl?: string }) {
    return this.authService.resendVerification(body.email, body.baseUrl);
  }

  /** Public endpoint: returns beta configuration */
  @Public()
  @Get('beta-config')
  @ApiOperation({ summary: 'Get beta configuration (guest limit, status, invitation limits)' })
  async getBetaConfig() {
    const [betaVal, maxGuestsVal, basicVal, premiumVal, enterpriseVal] = await Promise.all([
      this.settingsService.getSystemValue('beta_mode'),
      this.settingsService.getSystemValue('default_max_guests'),
      this.settingsService.getSystemValue('beta_max_invitations_basic'),
      this.settingsService.getSystemValue('beta_max_invitations_premium'),
      this.settingsService.getSystemValue('beta_max_invitations_enterprise'),
    ]);
    return {
      isBeta: betaVal === 'true',
      defaultMaxGuests: parseInt(maxGuestsVal || '300', 10),
      maxInvitations: {
        BASIC: parseInt(basicVal || '1', 10),
        PREMIUM: parseInt(premiumVal || '3', 10),
        FAST_SERVE: parseInt(enterpriseVal || '1', 10),
      },
    };
  }

  @Post('first-login-complete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark first login welcome as seen' })
  async firstLoginComplete(@CurrentUser('id') userId: string) {
    return this.authService.markFirstLoginComplete(userId);
  }

  @Post('verify-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify current password' })
  async verifyPassword(
    @CurrentUser('id') userId: string,
    @Body('currentPassword') currentPassword: string,
  ) {
    return this.authService.verifyPassword(userId, currentPassword);
  }

  @Patch('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current user password' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }
}
