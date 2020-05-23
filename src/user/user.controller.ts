import { Controller, Post, Body, HttpCode, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ValidationException } from 'src/lib/validation-error';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(204)
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
