import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid"

interface ImageGalleryProps {
    images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return <div>No hay imágenes disponibles actualmente</div>;
  }

  const nextImage = () =>
    setSelectedIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Imagen grande - Principal */}
      <div className="relative">
        <img
          src={images[selectedIndex]}
          alt="Imagen del producto"
          className="max-w-md h-96 object-contain rounded"
        />
        {/* Flechas para movernos */}
        <button
          onClick={prevImage}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-200 rounded-full px-2"
        >
          <ChevronLeftIcon className="h-6 w-6 text-gray-600 cursor-pointer" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-200 rounded-full px-2"
        >
            <ChevronRightIcon className="h-6 w-6 text-gray-600 cursor-pointer" />
        </button>
      </div>

      {/* Fotos mini como carrusel */}
      <div className="flex flex-col gap-2">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt="Miniatura"
            onClick={() => setSelectedIndex(i)}
            className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
              i === selectedIndex ? "border-indigo-600" : "border-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
}