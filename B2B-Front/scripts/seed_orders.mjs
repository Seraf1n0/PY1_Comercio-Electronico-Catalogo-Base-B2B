import 'dotenv/config';
import { algoliasearch } from 'algoliasearch';
import { createRequire } from 'module';


const require = createRequire(import.meta.url);
const orders = require('../data/orders.json');

// 1. Inicializa el cliente con tus credenciales de Algolia
const APP_ID = process.env.VITE_ALGOLIA_APP_ID;
const API_KEY = process.env.VITE_ALGOLIA_WRITE_KEY;
const INDEX_NAME = process.env.VITE_ALGOLIA_ORDERS_INDEX_NAME || 'orders';

if (!APP_ID) {
  console.error('Falta la variable de entorno VITE_ALGOLIA_APP_ID.');
  process.exit(1);
}

if (!API_KEY) {
  console.error('Falta la variable de entorno VITE_ALGOLIA_WRITE_KEY.');
  process.exit(1);
}

const client = algoliasearch(APP_ID, API_KEY);

// Cada orden se publica con objectID y el nombre completo ya resuelto,
// que es lo que AL-03 usa como atributo de busqueda y criterio de orden.
const objects = orders.map((order) => ({
  ...order,
  objectID: String(order.orderNumber),
  buyer: {
    ...order.buyer,
    fullName: `${order.buyer.name} ${order.buyer.lastName}`.trim() || order.userName,
  },
}));

async function seedOrders() {
  try {
    console.log('Iniciando la carga de ordenes a Algolia...');

    // saveObjects es idempotente por objectID: no borra el resto del indice.
    await client.saveObjects({
      indexName: INDEX_NAME,
      objects,
    });

    console.log(`¡Éxito! ${objects.length} orden(es) indexadas en "${INDEX_NAME}".`);
  } catch (error) {
    console.error('Error al subir las ordenes a Algolia:', error);
    process.exit(1);
  }
}

seedOrders();
