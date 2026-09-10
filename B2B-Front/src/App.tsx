import { HashRouter } from 'react-router-dom';
import { liteClient as algoliasearch } from "algoliasearch/lite";
import { InstantSearch, SearchBox, Hits, HitsPerPage  } from "react-instantsearch";
import CategoryFilter from './pages/search/components/CategoryFilter';
import PriceRange from './pages/search/components/PriceRange';
import BrandFilter from './pages/search/components/BrandFilter';
import Pagination from './pages/search/components/Pagination';
import type { Product } from './Catalog/types';
import ColorFilter from './pages/search/components/ColorFilter';
import DoorsFilter from './pages/search/components/DoorsFilter';
import DrivetrainFilter from './pages/search/components/DrivetrainFilter';
import EngineFilter from './pages/search/components/EngineFilter';
import { ColorEditor } from '@adobe/react-spectrum';

const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_KEY
);

//Índice de algolia para que ahora provenga de las variables de entorno
const algoliaIndex:string = import.meta.env.VITE_ALGOLIA_INDEX_NAME;


// Esto es para poder mostrar resultados
function Hit({ hit }: {hit: Product}) {
  return (
    <article>
      <img src={hit.images_urls?.[0]} alt={hit.title} />
      <p>{hit.categories?.[0] ?? "Sin categoría"}</p>
      <h1>{hit.title ?? "Sin título"}</h1>
      <p>₡{hit.price?.toLocaleString('es-CR') ?? "N/D"}</p>
    </article>
  );
}

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-800/80">
        <h1 className="text-1xl font-bold underline text-white text-center">
          Proyecto 1 - Comercio Electronico - Catalogo Base B2B
        </h1>

      <InstantSearch searchClient={searchClient} indexName = {algoliaIndex} >
        <Pagination />
        <SearchBox />
        <p>Categoría</p>
        <CategoryFilter />
        <p>Precio</p>
        <PriceRange />
        <p>Marca</p>
        <BrandFilter />
        <p>Color</p>
        <ColorFilter />
        <p># de puertas</p>
        <DoorsFilter />
        <p>drivetrain</p>
        <DrivetrainFilter  />
        <p>motor</p>
        <EngineFilter  />
        <HitsPerPage
                className="container-option"
                items={[
                  {
                    label: '16 hits per page',
                    value: 16,
                    default: true,
                  },
                  {
                    label: '32 hits per page',
                    value: 32,
                  },
                  {
                    label: '64 hits per page',
                    value: 64,
                  },
                ]}
              />
        <Hits hitComponent={Hit} classNames={{
        list: "grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4",
      }} />
        
      </InstantSearch>
      
      </div>
    </HashRouter>
  )
}
export default App