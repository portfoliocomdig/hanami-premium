const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Instância única do Sequelize.
 * Suporta dois formatos de configuração:
 *  1) DATABASE_URL única (padrão de provedores gerenciados como Neon,
 *     Supabase, Railway) — ex.: postgresql://user:pass@host/db?sslmode=require
 *  2) Variáveis separadas DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD
 *     (padrão usado no docker-compose local)
 * Se DATABASE_URL estiver definida, ela tem prioridade.
 */
const useConnectionString = Boolean(process.env.DATABASE_URL);

// Provedores gerenciados (Neon, Supabase etc.) exigem SSL. Detectamos pelo
// próprio host da connection string ou por uma flag explícita DB_SSL=true.
const requiresSSL =
  process.env.DB_SSL === 'true' ||
  (process.env.DATABASE_URL || '').includes('sslmode=require') ||
  (process.env.DATABASE_URL || '').includes('neon.tech') ||
  (process.env.DATABASE_URL || '').includes('supabase.co');

const dialectOptions = requiresSSL
  ? { ssl: { require: true, rejectUnauthorized: false } }
  : {};

const commonOptions = {
  dialect: 'postgres',
  dialectOptions,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  define: {
    underscored: true, // colunas snake_case no banco, camelCase no JS
    timestamps: true
  }
};

const sequelize = useConnectionString
  ? new Sequelize(process.env.DATABASE_URL, commonOptions)
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      { host: process.env.DB_HOST, port: process.env.DB_PORT || 5432, ...commonOptions }
    );

module.exports = sequelize;
