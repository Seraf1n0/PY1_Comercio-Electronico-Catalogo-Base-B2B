import 'dotenv/config';
import { algoliasearch } from 'algoliasearch';
import { createRequire } from 'module';


const require = createRequire(import.meta.url);
const products = require('../data/products.json');

// 1. Inicializa el cliente con tus credenciales de Algolia
const APP_ID = process.env.VITE_ALGOLIA_APP_ID;
const API_KEY = process.env.VITE_ALGOLIA_WRITE_KEY;
const INDEX_NAME = process.env.VITE_ALGOLIA_INDEX_NAME;

const client = algoliasearch(APP_ID, API_KEY);

async function seedDatabase() {
  try {
    console.log('Iniciando la carga de datos a Algolia...');

    const response = await client.saveObjects({
      indexName: INDEX_NAME,
      objects: products
    });

    console.log('¡Éxito! Datos indexados de manera correcta.');
    console.log(`IDs generados/actualizados:`, response);
  } catch (error) {
    console.error('Error al subir los datos a Algolia:', error);
  }
}

seedDatabase();
