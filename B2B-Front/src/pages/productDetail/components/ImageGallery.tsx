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
    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
      {/* Imagen grande - Principal */}
      <div className="relative w-full md:w-auto">
        <img
          src={images[selectedIndex]}
          alt="Imagen del producto"
          className="w-full md:max-w-md h-64 sm:h-80 md:h-96 object-contain rounded"
        />
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

      {/* Fotos mini */}
      <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt="Miniatura"
            onClick={() => setSelectedIndex(i)}
            className={`w-16 h-16 md:w-20 md:h-20 shrink-0 object-cover rounded cursor-pointer border-2 ${
              i === selectedIndex ? "border-indigo-600" : "border-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
}