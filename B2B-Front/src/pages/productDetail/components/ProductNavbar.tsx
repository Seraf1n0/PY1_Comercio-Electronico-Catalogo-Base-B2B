import {HomeIcon, LinkIcon, HeartIcon, ShoppingCartIcon } from "@heroicons/react/24/solid";

interface ProductNavbarProps {
  title: string;
  totalStock: number;
}

export default function ProductNavbar({ title, totalStock }: ProductNavbarProps) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="flex items-center justify-between bg-white shadow px-6 py-3">
      <div className="flex items-center gap-4">
        <HomeIcon className="h-6 w-6 text-gray-700 cursor-pointer hover:text-indigo-600" />
        <div>
          <p className="font-bold">{title}</p>
          <p className="text-sm text-gray-500">Stock total: {totalStock}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
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