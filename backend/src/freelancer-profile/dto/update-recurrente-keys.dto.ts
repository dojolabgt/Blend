import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateRecurrenteKeysDto {
    @IsString()
    @IsNotEmpty()
    publicKey: string;

    @IsString()
    @IsNotEmpty()
    privateKey: string;
}
