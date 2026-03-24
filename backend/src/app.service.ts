import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      status: 'protected',
      message: 'Acceso no autorizado.',
    };
  }
}
