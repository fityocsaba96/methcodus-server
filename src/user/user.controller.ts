import { Controller, Post, Body, HttpCode, UsePipes, Put, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { ValidationException, validationPipe } from 'src/lib/validation-error';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { Request as ExpressRequest } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(204)
  @UsePipes(validationPipe)
  public async create(@Body() createUserDto: CreateUserDto): Promise<void> {
    if (await this.userService.existsUserName(createUserDto.userName)) {
      throw new ValidationException(['This user name is not available!']);
    }
    this.validatePasswordsMatch(createUserDto);
    await this.userService.insert(createUserDto);
  }

  @Put('me')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @UsePipes(validationPipe)
  public async updateMine(@Request() request: ExpressRequest, @Body() updateUserDto: UpdateUserDto): Promise<void> {
    this.validatePasswordsMatch(updateUserDto);
    await this.userService.update((request.user as any)._id, updateUserDto);
  }

  private validatePasswordsMatch(userDto: CreateUserDto | UpdateUserDto): void {
    if (userDto.password !== userDto.passwordConfirmation) {
      throw new ValidationException(['Passwords does not match!']);
    }
  }
}
