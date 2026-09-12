import { liteClient as algoliasearch } from "algoliasearch/lite";

export const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_KEY
);

export const algoliaIndex: string = import.meta.env.VITE_ALGOLIA_INDEX_NAME;