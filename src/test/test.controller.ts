import { Controller, Get, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';
import { TestService } from './test.service';
import { TestInterceptor1, TestInterceptor2, TestInterceptor3 } from './decorators/test.interceptor';


@Controller('test')
export class TestController {

  constructor(private readonly testService: TestService) {}

  @UseInterceptors(TestInterceptor1)
  @Get('1')
  findAll() {
    console.log("Segundo: Lo segundo que se ejecuta es lo del controlador y servicio, Este es el controlador")
    return this.testService.findAll();
  }

  @UseInterceptors(TestInterceptor2)
  @Get('2')
  findAll2() {
    console.log("Segundo: Lo segundo que se ejecuta es lo del controlador y servicio, Este es el controlador")
    return this.testService.findAll();
  }

  @UseInterceptors(TestInterceptor3)
  @Patch('3/:id')
  update(@Param('id') id: string) {
    return this.testService.update();
  }
  
  @Delete('4/:id')
  remove(@Param('id') id: string) {
    return this.testService.remove(id);
  }
}
