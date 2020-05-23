import { Controller, Post, Body, HttpCode, UsePipes, Put, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { ValidationException, validationPipe } from 'src/lib/validation';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(204)
  @UsePipes(validationPipe)
  public async create(@Body() createUserDto: CreateUserDto): Promise<void> {
    if (await this.userService.existsUserName(createUserDto.userName)) {
      throw new ValidationException({ userName: 'This user name is not available!' });
    }
    this.validatePasswordsMatch(createUserDto);
    await this.userService.insert(createUserDto);
  }

  @Put('me')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @UsePipes(validationPipe)
  public async update(@Request() request, @Body() updateUserDto: UpdateUserDto): Promise<void> {
    this.validatePasswordsMatch(updateUserDto);
    await this.userService.update(request.user._id, updateUserDto);
  }

  private validatePasswordsMatch(userDto: CreateUserDto | UpdateUserDto): void {
    if (userDto.password !== userDto.passwordConfirmation) {
      throw new ValidationException({ password: 'Passwords does not match!' });
    }
  }
}
