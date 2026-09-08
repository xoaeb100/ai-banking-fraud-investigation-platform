import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

import { Role } from '../modules/roles/entities/role.entity';
import { User } from '../modules/users/entities/user.entity';
import { Transaction } from '../modules/transaction/entities/transaction.entity';
import { Alert } from '../modules/alert/entities/alert.entity';
import { InvestigationCase } from '../modules/investigation-case/entities/investigation-case.entity';
config();

export default new DataSource({
  type: 'postgres',

  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),

  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,

  entities: [Role, User, Transaction, Alert, InvestigationCase],

  migrations: ['src/database/migrations/*.ts'],

  synchronize: false,
});
