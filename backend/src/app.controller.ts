import { Controller, Get, HttpCode } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @HttpCode(401)
  root(): object {
    return {
      status: 'protected',
      message: 'Acceso no autorizado.',
    };
  }
}
