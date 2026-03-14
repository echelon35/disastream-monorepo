import { IsEmail, IsStrongPassword } from "class-validator";

export class UserLoginDto {
  @IsEmail()
  mail: string;
  @IsStrongPassword()
  password: string;
}