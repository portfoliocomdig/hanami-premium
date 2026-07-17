/**
 * Popula o banco com os pratos do cardápio original (script.js) e cria um
 * usuário administrador padrão. Rodar com: npm run seed
 */
require('dotenv').config();
const { sequelize, Product, User } = require('../models');

const cardapio = [
  { name: 'Combo Sushi Tradicional', category: 'sushi', description: '12 peças: salmão, atum, camarão e peixe branco, cuidadosamente montados.', price: 89.9, featured: true, imageUrl: 'hanami-combo' },
  { name: 'Sushi Especial Hanami', category: 'sushi', description: '16 peças premium com seleção exclusiva do chef Hideo.', price: 129.9, featured: true, imageUrl: 'hanami-especial' },
  { name: 'Sashimi de Salmão', category: 'sashimi', description: '12 fatias generosas de salmão fresco, cortadas à mão com precisão.', price: 69.9, featured: false, imageUrl: 'hanami-sashimi1' },
  { name: 'Sashimi Misto', category: 'sashimi', description: '12 fatias de salmão, atum e peixe branco com wasabi fresco e gengibre.', price: 79.9, featured: false, imageUrl: 'hanami-sashimi2' },
  { name: 'Nikuman', category: 'chuukaman', description: 'Pãozinho cozido no vapor, recheado com carne de porco, shiitake, cebolinha e gengibre.', price: 49.9, featured: false, imageUrl: 'hanami-nikuman' },
  { name: 'Gyuman', category: 'chuukaman', description: 'Pãozinho cozido no vapor, com carne bovina temperada no estilo sukiyaki.', price: 52.9, featured: false, imageUrl: 'hanami-gyuman' },
  { name: 'Temaki de Salmão', category: 'temaki', description: 'Cone crocante com arroz, salmão fresco, cebolinha e gergelim.', price: 39.9, featured: false, imageUrl: 'hanami-temaki1' },
  { name: 'Temaki de Atum', category: 'temaki', description: 'Cone crocante com arroz, atum fresco, cebolinha e gergelim.', price: 36.9, featured: false, imageUrl: 'hanami-temaki2' },
  { name: 'Nigiri de Salmão (4 un.)', category: 'nigiri', description: 'Quatro peças de nigiri com fatia generosa de salmão sobre arroz temperado.', price: 34.9, featured: false, imageUrl: 'hanami-nigiri1' },
  { name: 'Nigiri de Atum (4 un.)', category: 'nigiri', description: 'Quatro peças com atum de qualidade premium, levemente marinado.', price: 37.9, featured: false, imageUrl: 'hanami-nigiri2' },
  { name: 'Ramen Tonkotsu', category: 'quentes', description: 'Caldo rico de porco cozido por 12 horas, macarrão fino, ovo marinado e chashu.', price: 52.9, featured: true, imageUrl: 'hanami-ramen' },
  { name: 'Udon Tradicional', category: 'quentes', description: 'Macarrão udon em molho de shoyu, com tempurá, naruto, ovo, shiitake, nori e cebolinha.', price: 44.9, featured: false, imageUrl: 'hanami-udon' },
  { name: 'Donburi Gyudon', category: 'quentes', description: 'Tigela de arroz com carne bovina cozida com shoyu, gengibre e cebola.', price: 48.9, featured: false, imageUrl: 'hanami-donburi' },
  { name: 'Edamame', category: 'entradas', description: 'Vagens de edamame cozidas no vapor com sal grosso marinho.', price: 22.9, featured: false, imageUrl: 'hanami-edamame' },
  { name: 'Gyoza (8 unidades)', category: 'entradas', description: 'Dumplings recheados de porco e vegetais, grelhados até ficarem crocantes.', price: 32.9, featured: false, imageUrl: 'hanami-gyoza' },
  { name: 'Sunomono', category: 'entradas', description: 'Salada refrescante de pepino com vinagrete de arroz, gergelim e camarão.', price: 24.9, featured: false, imageUrl: 'hanami-sunomono' },
  { name: 'Mochi Ice (3 unidades)', category: 'sobremesas', description: 'Bolinhos de arroz japoneses com recheio de matcha, chocolate e morango.', price: 28.9, featured: false, imageUrl: 'hanami-mochi' },
  { name: 'Dorayaki', category: 'sobremesas', description: 'Doce feito com duas fatias de panqueca tipo kasutera, recheada com anko.', price: 26.9, featured: false, imageUrl: 'hanami-dorayaki' }
];

async function run() {
  await sequelize.sync();

  await Product.destroy({ where: {}, truncate: true, cascade: true });
  await Product.bulkCreate(cardapio.map((p) => ({ ...p, stock: 50, active: true })));
  console.log(`✔ ${cardapio.length} produtos inseridos.`);

  const [admin, created] = await User.findOrCreate({
    where: { email: 'admin@hanami.com.br' },
    defaults: {
      name: 'Administrador Hanami',
      passwordHash: 'Admin@123', // o hook do model faz o hash automaticamente
      role: 'admin'
    }
  });
  console.log(created ? `✔ Admin criado: ${admin.email} / senha: Admin@123` : '✔ Admin já existia.');

  await sequelize.close();
}

run().catch((err) => {
  console.error('✘ Erro ao popular o banco:', err);
  process.exit(1);
});
