import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailUserDto } from 'src/users/dto';

@Injectable()
export class SendEmailService {
  constructor(private readonly mailerService: MailerService) {}

  public recoveryPassword(
    emailUserDto: EmailUserDto,
    newPassword: string,
  ): void {
    this.mailerService
      .sendMail({
        from: 'martinprado1000@gmail.com',
        to: emailUserDto.email,
        subject: 'Recuperación de contraseña ✔',
        html: `<div>
                <h1>La nueva contraseña para el usuario ${emailUserDto.email} es: ${newPassword}</h1>
            </div>`,
      })
      .then((success) => {
        //console.log(success);
        return "enviado";
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
