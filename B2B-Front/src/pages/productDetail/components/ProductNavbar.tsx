import {HomeIcon, LinkIcon, HeartIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import FeedbackAlert from "../../../components/FeedbackAlert";
import CartPreview from "../../../components/CartPreview";
import { useState } from "react";

interface ProductNavbarProps {
  title: string;
  totalStock: number;
}

export default function ProductNavbar({ title, totalStock }: ProductNavbarProps) {

  const [trigger, setTrigger] = useState(0);
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState("");

  // Estado de favorito
  const [isFavorite, setIsFavorite] = useState(false);

  // Copiar enlace del producto
  // Con retroalimentación visual para indicar que se copio
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setMensaje("Enlace copiado al portapapeles");
    setTrigger(prev => prev + 1);
  };

  // Marcar como favorito (TODO: Agregar en localhost)
  const handleFavorite = () => {
    setMensaje("Producto agregado a favoritos");
    // Toggle:
    setIsFavorite(!isFavorite);
    setTrigger(prev => prev + 1);
    // cambiar el color del icono a rojo si es favorito, y gris si no lo es
    if (isFavorite) {
      document.querySelector(".heart-icon")?.classList.remove("text-red-500");
    } else {
      document.querySelector(".heart-icon")?.classList.add("text-red-500");
    }
  }

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white shadow px-4 sm:px-6 py-3">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <HomeIcon className="h-6 w-6 shrink-0 text-gray-700 cursor-pointer hover:text-indigo-600"
        onClick={handleGoHome} />
        <div className="min-w-0">
          <p className="font-bold truncate">{title}</p>
          <p className="text-sm text-gray-500">Stock total: {totalStock}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <LinkIcon
          className="h-6 w-6 text-gray-700 cursor-pointer hover:text-indigo-600"
          onClick={handleCopyLink}
        />
        <HeartIcon 
          className="heart-icon h-6 w-6 text-gray-700 cursor-pointer hover:text-red-500" 
          onClick={handleFavorite} />
        <CartPreview />
      </div>

      <FeedbackAlert mensaje={mensaje} trigger={trigger} duration={3000} />
    </div>

  );
}