import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput, RegisterInput, AuthPayload } from './dto/auth.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    const result = await this.authService.login(input.email, input.password);
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user as any,
    };
  }

  @Mutation(() => AuthPayload)
  async register(@Args('input') input: RegisterInput): Promise<AuthPayload> {
    const result = await this.authService.register(
      input.email,
      input.password,
      input.fullName,
      input.role,
      input.departmentId,
    );
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user as any,
    };
  }

  @Mutation(() => String)
  async refreshToken(@Args('refreshToken') refreshToken: string): Promise<string> {
    const result = await this.authService.refreshToken(refreshToken);
    return result.accessToken;
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}

