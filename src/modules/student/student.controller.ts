import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StudentService } from './student.service';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  findAll(@Req() req) {
    return this.studentService.findAll(req.user.userId);
  }

  // Endpoint temporário para desenvolvimento sem autenticação  
  @Get('dev-test')
  @HttpCode(HttpStatus.OK)
  async devTestStudents() {
    // Usando userId real do banco para testes em desenvolvimento
    const devUserId = '69852a11dd888bf6ee059ca7';  
    return this.studentService.findAll(devUserId);
  }

  // Endpoint temporário para testar detalhes de estudante
  @Get('dev-test/:phoneNumber')
  @HttpCode(HttpStatus.OK)
  async devTestStudentDetails(@Param('phoneNumber') phoneNumber: string) {
    const devUserId = '69852a11dd888bf6ee059ca7';
    return this.studentService.findOne(devUserId, phoneNumber);
  }

  @Get(':phoneNumber')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  findOne(@Param('phoneNumber') phoneNumber: string, @Req() req) {
    return this.studentService.findOne(req.user.userId, phoneNumber);
  }
}
