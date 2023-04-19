require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const {
  DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT
} = process.env;
const { DataTypes } = require('sequelize');

let sequelize = process.env.NODE_ENV === 'production'
  ? new Sequelize({
      database: DB_NAME,
      dialect: 'postgres',
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USER,
      password: DB_PASSWORD,
      pool: {
        max: 3,
        min: 1,
        idle: 10000,
      },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      keepAlive: true,
  },
  ssl: true,
}) 
: new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/appgym`, {
  logging: false, // set to console.log to see the raw SQL queries
  native: false, // lets Sequelize know we can use pg-native for ~30% more speed
});
const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring

const { Excercise , Muscle, Product, Routine, User, Class, Membresy, User_Routine, Feedback, Routine_Excercise, Category, Item, Sale, SubscriptionSale } = sequelize.models;

// Aca vendrian las relaciones
// Product.hasMany(Reviews);

User.belongsToMany(Routine, {through: User_Routine, timestamps: false});
Routine.belongsToMany(User, {through: User_Routine, timestamps: false});

Routine.belongsToMany(Excercise, {through: Routine_Excercise})
Excercise.belongsToMany(Routine, {through: Routine_Excercise})

Routine.belongsTo(Category);
Category.hasMany(Routine);

Excercise.belongsTo(Muscle);
Muscle.hasMany(Excercise);

User.belongsToMany(Product, {through: 'User_Product', timestamps: false});
Product.belongsToMany(User, {through: 'User_Product', timestamps: false});

User.hasMany(Class);
Class.belongsTo(User);

Feedback.belongsTo(User);
User.hasMany(Feedback);

User.hasMany(Sale);
Sale.belongsTo(User);

Sale.hasMany(Item);
Item.belongsTo(Sale);

User.hasOne(SubscriptionSale);
SubscriptionSale.belongsTo(User);


module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize, // para importart la conexión { conn } = require('./db.js');
};
