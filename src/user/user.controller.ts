import { Controller, Post, Body, HttpCode, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './user.dto';
import { ValidationException, validationPipe } from 'src/lib/validation';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(204)
  @UsePipes(validationPipe)
  public async create(@Body() createUserDto: CreateUserDto): Promise<ValidationException | void> {
    if (await this.userService.existsUserName(createUserDto.userName)) {
      throw new ValidationException({ userName: 'This user name is not available!' });
    } else if (createUserDto.password !== createUserDto.passwordConfirmation) {
      throw new ValidationException({ password: 'Passwords does not match!' });
    } else {
      await this.userService.insert(createUserDto);
    }
  }
}
