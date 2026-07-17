const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✔ Conexão com PostgreSQL estabelecida.');

    // Em produção, prefira migrations (npm run migrate) a sync().
    const sync = process.env.NODE_ENV === 'development';
    await sequelize.sync({ alter: sync });
    if (sync) console.log('✔ Modelos sincronizados com o banco (modo desenvolvimento).');

    app.listen(PORT, () => console.log(`✔ API Hanami rodando na porta ${PORT}`));
  } catch (err) {
    console.error('✘ Falha ao iniciar o servidor:', err);
    process.exit(1);
  }
}

start();
