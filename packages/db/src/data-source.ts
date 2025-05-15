import { DataSource } from 'typeorm';
import { config } from './config';
import { User } from './entities/User';
import { Garden } from './entities/Garden';
import { GardenMember } from './entities/GardenMember';
import { Plot } from './entities/Plot';
import { Tree } from './entities/Tree';
import { Animal } from './entities/Animal';
import { Building } from './entities/Building';
import { QuestProgress } from './entities/QuestProgress';
import { InviteBonus } from './entities/InviteBonus';
import { StarTransaction } from './entities/StarTransaction';
import { Purchase } from './entities/Purchase';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  synchronize: false,
  logging: config.nodeEnv === 'development',
  entities: [
    User,
    Garden,
    GardenMember,
    Plot,
    Tree,
    Animal,
    Building,
    QuestProgress,
    InviteBonus,
    StarTransaction,
    Purchase,
  ],
  migrations: ['dist/migrations/*.js'],
  subscribers: [],
});

export default AppDataSource;
