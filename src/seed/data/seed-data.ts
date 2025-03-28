import * as dotenv from 'dotenv';
dotenv.config();
import { ConfigService } from '@nestjs/config';
const configService = new ConfigService();
const passwordSeedUsers = configService.get<string>('PASSWORD_SEED_USERS') as string;

import { Role } from 'src/users/enums/role.enums';

interface SeedUser {
    _id?: string;
    name: string;
    lastname: string;
    email: string;
    password: string;
    confirmPassword: string;
    roles: Role[] | Role;
    isActive: boolean;
}


interface SeedData {
    users: SeedUser[];
}


export const initialData: SeedData = {
    users: [
        {   
            name: 'Test_superadmin_name',
            lastname: 'Test superadmin lastname',
            email: 'superadmin@google.com',
            password: passwordSeedUsers,
            confirmPassword: passwordSeedUsers,
            roles: [Role.SUPERADMIN],
            isActive: true
        },
        {
            name: 'Test_admin_name',
            lastname: 'Test admin lastname',
            email: 'admin@google.com',
            password: passwordSeedUsers,
            confirmPassword: passwordSeedUsers,
            roles: [Role.ADMIN],
            isActive: true
        },
        {
            name: 'Test_operator_name',
            lastname: 'Test operator lastname',
            email: 'operator@google.com',
            password: passwordSeedUsers,
            confirmPassword: passwordSeedUsers,
            roles: [Role.OPERATOR],
            isActive: true
        },
        {
            name: 'Test_user_name',
            lastname: 'Test user lastname',
            email: 'user@google.com',
            password: passwordSeedUsers,
            confirmPassword: passwordSeedUsers,
            roles: [Role.USER],
            isActive: true
        }
    ]
}