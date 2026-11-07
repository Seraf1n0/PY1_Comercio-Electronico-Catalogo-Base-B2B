import { useEffect, useRef } from "react";

/**
 * Llama a `callback` cuando OTRA pestaña cambia el localStorage.
 * Solo reacciona a las claves que empiecen con alguno de los prefijos dados.
 */
export function useStorageSync(
  prefix: string | readonly string[],
  callback: () => void,
): void {

  const callbackRef = useRef(callback);

  const prefixes = typeof prefix === "string" ? prefix : prefix.join("\n");

  // Mantiene la caja con el callback más reciente
  useEffect(() => {
    callbackRef.current = callback;
  });

  // Se suscribe al evento `storage` de la ventana
  useEffect(() => {
    const list = prefixes.split("\n");

    function handleStorage(event: StorageEvent) {
  
      if (event.storageArea !== window.localStorage) {
        return;
      }

      // event.key === null significa que alguien hizo localStorage.clear()
      if (event.key === null || list.some((p) => event.key!.startsWith(p))) {
        callbackRef.current();
      }
    }

    window.addEventListener("storage", handleStorage);

    // Al salir de la página se quita el listener
    return () => window.removeEventListener("storage", handleStorage);
  }, [prefixes]);
}