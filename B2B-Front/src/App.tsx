import { HashRouter } from 'react-router-dom';
import { liteClient as algoliasearch } from "algoliasearch/lite";
import { InstantSearch, SearchBox, Hits  } from "react-instantsearch";
import CategoryFilter from './pages/search/components/CategoryFilter';
import PriceRange from './pages/search/components/PriceRange';

const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_KEY
);


// Esto es para poder mostrar resultados
function Hit({ hit }) {
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

      <InstantSearch searchClient={searchClient} indexName="grupo-01_products">
        <SearchBox />
        <CategoryFilter />
        <PriceRange />
        <Hits hitComponent={Hit} />
        
      </InstantSearch>
      
      </div>
    </HashRouter>
  )
}
export default App