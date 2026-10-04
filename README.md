# PY1_Comercio-Electronico-Catalogo-Base-B2B

## Colaboradores:
- **Dylan Rodríguez** (Desarrollador web, UI/UX Designer)
- **Bryan Londoño** (Desarrollador web, UI/UX Designer, Modelado de datos y generación de catálogo)
- **Yosimar Montenegro** (Modelado de datos, Configuración de Algolia, Transformación de datos)

## Deploy
**Enlace a gh-pages**: https://seraf1n0.github.io/PY1_Comercio-Electronico-Catalogo-Base-B2B/#/

## Instrucciones de ejecución:

`npm install` para instalar dependencias
`npm run build` para confirmar compilación
`npm run dev` para ejecutar
`npm run lin`t para revisión

### Variables de entorno necesarias:

```python
VITE_ALGOLIA_APP_ID=ID_ALGOLIA
VITE_ALGOLIA_SEARCH_KEY=API_KEY_BUSQUEDA
VITE_ALGOLIA_WRITE_KEY=API_KEY_ESCRITURA # No es buena practica usar solo el admin_key
VITE_ALGOLIA_INDEX_NAME=NOMBRE_DEL_INDICE # para consulta y escritura
```

## Terceros-de-Github
Subida y GET automatico de imagenes a CDN:
https://github.com/Dennis290699/upload-Images-Cloudinary