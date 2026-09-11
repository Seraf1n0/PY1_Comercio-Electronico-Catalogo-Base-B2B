import { HashRouter } from 'react-router-dom';
import { liteClient as algoliasearch } from "algoliasearch/lite";
import { InstantSearch, SearchBox, Hits, HitsPerPage  } from "react-instantsearch";

import RangeSliderFilter  from './pages/search/components/RangeSliderFilter';
import Pagination from './pages/search/components/Pagination';
import type { Product } from './Catalog/types';
import DropdownFilter from './pages/search/components/DropdownFilter';
import ToggleFilter from './pages/search/components/ToggleFilter';
import YesNoFilter from './pages/search/components/YesNoFilter';
import ToggleFilterWithSearchBox from './pages/search/components/ToggleFilterWithSearchBox';
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
        <p>Marca</p>
        <ToggleFilterWithSearchBox attribute="brand" limit={50}/>
        <p>Categoría</p>
        <ToggleFilterWithSearchBox attribute="categories" limit={50}/>
        <p>Precio</p>
        <RangeSliderFilter
          pLabel="Precio"
          rangeProps={{ attribute: "price" }}
        />
        
        <p>Color</p>
    
        <ToggleFilterWithSearchBox attribute="facets.color" limit={50}/>
        <p># de puertas</p>
        <ToggleFilter attribute="facets.doors" limit={50}/>
       
        <p>drivetrain</p>
        <ToggleFilterWithSearchBox attribute="facets.drivetrain" limit={50}/>
      
        <p>motor</p>
        <ToggleFilterWithSearchBox attribute="facets.engine" limit={50}/>
       
        <p>Tipo de Combustible</p>
        <ToggleFilter attribute="facets.fuel_type" />
        <p>Capacidad de tanque</p>
        <DropdownFilter pAtribute="facets.fuel_capacity" />
        <p>Velocidad máxima</p>
        <DropdownFilter pAtribute="facets.max_speed" />
        <p>CV de potencia</p>
        <DropdownFilter pAtribute="facets.power" />
        <p>torque</p>
        <DropdownFilter pAtribute="facets.torque" />
        <p>Tracción</p>
        <ToggleFilter attribute="facets.traction" />
        <p>Transmisión</p>
        <ToggleFilterWithSearchBox attribute="facets.transmission" limit={50}/>
  
        <p>Año</p>
          <RangeSliderFilter
          pLabel="Año"
          rangeProps={{ attribute: "facets.year" }}
        />
        <p>En stock</p>
        <YesNoFilter attribute="in_stock"/>
       
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