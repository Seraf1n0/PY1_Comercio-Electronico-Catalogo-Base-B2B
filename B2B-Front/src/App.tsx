import { HashRouter, Routes, Route } from "react-router-dom";
import SearchPage from "./pages/search/SearchPage";
import ProductDetailPage from "./pages/productDetail/ProductDetailPage";
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import PaymentPage from "./pages/payment/PaymentPage";
import ConfirmationPage from "./pages/confirmation/ConfirmationPage";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFoundPage from "./pages/error/NotFoundPage";

function App() {
  return (
    <HashRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/producto/:id" element={<ProductDetailPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/finalizar-compra" element={<CheckoutPage />} />
          <Route path="/pago/:orderNumber" element={<PaymentPage />} />
          <Route path="/confirmacion/:orderNumber" element={<ConfirmationPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
    </HashRouter>
  );
}

export default App;