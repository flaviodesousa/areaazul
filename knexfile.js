module.exports = {

  development: {
    client: 'postgresql',
    connection: process.env.AREAAZULDB || {
      host: '/var/run/postgresql',
      database: 'areaazul'
    },
    debug: process.env.AREAAZULDBDEBUG !== undefined,
    migrations: {
      tableName: 'migrations'
    },
    seeds: {
      directory: './seeds/dev'
    }
  },

  staging: {
    client: 'postgresql',
    connection: process.env.AREAAZULDB || {
      host: '/var/run/postgresql',
      database: 'areaazul'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: process.env.AREAAZULDB || {
      host: '/var/run/postgresql',
      database: 'areaazul'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'migrations'
    }
  }
};
