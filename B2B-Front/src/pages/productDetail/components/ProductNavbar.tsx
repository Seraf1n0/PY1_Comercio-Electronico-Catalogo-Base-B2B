import {HomeIcon, LinkIcon, HeartIcon, ShoppingCartIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

interface ProductNavbarProps {
  title: string;
  totalStock: number;
}

export default function ProductNavbar({ title, totalStock }: ProductNavbarProps) {

  const navigate = useNavigate();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

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
        <HeartIcon className="h-6 w-6 text-gray-700 cursor-pointer hover:text-red-500" />
        <ShoppingCartIcon className="h-6 w-6 text-gray-700 cursor-pointer hover:text-indigo-600" />
      </div>
    </div>
  );
}