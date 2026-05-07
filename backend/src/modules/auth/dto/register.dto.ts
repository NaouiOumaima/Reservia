import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  ValidateIf,
} from 'class-validator';
import { UserRole } from '../../../database/schemas/user.schema';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsPhoneNumber(null)
  @IsOptional()
  phone?: string;

  @ValidateIf((o) => o.role === UserRole.PROVIDER)
  @IsString()
  @MinLength(2)
  businessName?: string;
}