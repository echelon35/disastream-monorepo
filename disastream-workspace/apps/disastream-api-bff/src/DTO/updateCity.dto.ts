import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCityDto {
  @IsInt()
  @IsNotEmpty()
  paysId: number;

  @IsInt()
  @IsNotEmpty()
  population: number;

  @IsInt()
  @IsOptional()
  altitude?: number;

  @IsString()
  @IsNotEmpty()
  timezone: string;
}
