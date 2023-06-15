import { Sequelize} from 'sequelize-typescript';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.HOST,
  database: process.env.DATABASE,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  models: [__dirname + '/models'], // or [Player, Team],
  sync: { force: true, alter: true },
  logging: false
})

export default sequelize;