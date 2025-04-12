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
            name: 'TestSuperadminName',
            lastname: 'TestSuperadminLastname',
            email: 'superadmin@google.com',
            password: passwordSeedUsers,
            confirmPassword: passwordSeedUsers,
            roles: Role.SUPERADMIN,
            isActive: true
        },
        {
            name: 'TestAdminName',
            lastname: 'TestAdminLastname',
            email: 'admin@google.com',
            password: passwordSeedUsers,
            confirmPassword: passwordSeedUsers,
            roles: Role.ADMIN,
            isActive: true
        },
        {
            name: 'TestOperatorName',
            lastname: 'TestOperatorLastname',
            email: 'operator@google.com',
            password: passwordSeedUsers,
            confirmPassword: passwordSeedUsers,
            roles: Role.OPERATOR,
            isActive: true
        },
        {
            name: 'TestUserName',
            lastname: 'TestUserLastname',
            email: 'user@google.com',
            password: passwordSeedUsers,
            confirmPassword: passwordSeedUsers,
            roles: Role.USER,
            isActive: true
        }
    ]
}