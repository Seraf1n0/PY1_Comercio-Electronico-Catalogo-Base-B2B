import { HashRouter, Routes, Route } from "react-router-dom";
import SearchPage from "./pages/search/SearchPage";
import ProductDetailPage from "./pages/productDetail/ProductDetailPage";
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/producto/:id" element={<ProductDetailPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/finalizar-compra" element={<CheckoutPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;