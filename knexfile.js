module.exports = {

  development: {
    client: 'postgresql',
    connection: process.env.AREAAZULDB || '/var/run/postgresql areaazul',
    debug: process.env.AREAAZULDBDEBUG !== undefined,
    migrations: {
      tableName: 'migrations',
    },
  },

  staging: {
    client: 'postgresql',
    connection: process.env.AREAAZULDB || '/var/run/postgresql areaazul',
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'migrations',
    },
  },

  production: {
    client: 'postgresql',
    connection: process.env.AREAAZULDB || '/var/run/postgresql areaazul',
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'migrations',
    },
  },

};
