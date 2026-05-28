import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';

describe('AuthController', () => {
  let controller: AuthController;
  let userService: { readMe: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn(),
            signIn: jest.fn(),
            signOut: jest.fn(),
            refreshSession: jest.fn(),
            sendPasswordResetRequest: jest.fn(),
            resetPassword: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            readMe: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    userService = module.get<{ readMe: jest.Mock }>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the authenticated user profile with name', async () => {
    userService.readMe.mockResolvedValue({
      id: 'user-1',
      email: 'piloto@kart.com',
      name: 'Piloto Kart',
      role: 'USER',
    });

    await expect(
      controller.me({ userId: 'user-1', email: 'piloto@kart.com' }),
    ).resolves.toEqual({
      userId: 'user-1',
      email: 'piloto@kart.com',
      name: 'Piloto Kart',
      role: 'USER',
    });

    expect(userService.readMe).toHaveBeenCalledWith('user-1');
  });
});
