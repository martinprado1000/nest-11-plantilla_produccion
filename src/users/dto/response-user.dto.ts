import { Expose, Transform } from 'class-transformer';
import { Role } from 'src/users/enums/role.enums';
export class ResponseUserDto {

  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  id: string;

  @Expose()
  name: string;

  @Expose()
  lastname: string;

  @Expose()
  email: string;

  @Expose()
  roles: Role;

  @Expose()
  isActive: boolean;

}
