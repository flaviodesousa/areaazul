module.exports = {

  development: {
    client: 'postgresql',
    connection: process.env.AREAAZULDB || '/var/run/postgresql areaazul',
    debug: true
  },

  staging: {
    client: 'postgresql',
    connection: process.env.AREAAZULDB || '/var/run/postgresql areaazul',
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
    connection: process.env.AREAAZULDB || '/var/run/postgresql areaazul',
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'migrations'
    }
  }

};