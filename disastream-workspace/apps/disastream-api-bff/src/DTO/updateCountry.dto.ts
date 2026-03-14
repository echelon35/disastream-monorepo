import { IsInt, IsOptional, IsString } from 'class-validator';
import { Geometry } from 'geojson';

export class UpdateCountryDto {
  @IsInt()
  @IsOptional()
  population?: number;

  @IsInt()
  @IsOptional()
  superficie?: number;

  @IsString()
  @IsOptional()
  wikilink?: string;

  @IsString()
  @IsOptional()
  trigramme?: string;

  @IsString()
  @IsOptional()
  iso3166_2?: string;

  @IsOptional()
  geom?: Geometry | string; // GeoJSON geometry object or string
}
