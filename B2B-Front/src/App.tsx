import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import SearchPage from "./pages/search/SearchPage";
import ProductDetailPage from "./pages/productDetail/ProductDetailPage";
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import PaymentPage from "./pages/payment/PaymentPage";
import ConfirmationPage from "./pages/confirmation/ConfirmationPage";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFoundPage from "./pages/error/NotFoundPage";
import TermsAndConditionsPage from "./pages/information/TermsAndConditionsPage";
import SiteFooter from "./components/SiteFooter";
import LoginPage from "./pages/login/LoginPage";
import RequireAuth from "./auth/RequireAuth";


function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/terminos-y-condiciones" element={<TermsAndConditionsPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/" element={<SearchPage />} />
            <Route path="/producto/:id" element={<ProductDetailPage />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/finalizar-compra" element={<CheckoutPage />} />
            <Route path="/pago/:orderNumber" element={<PaymentPage />} />
            <Route path="/confirmacion/:orderNumber" element={<ConfirmationPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <SiteFooter />
      </ErrorBoundary>
    </HashRouter>
  );
}

export default App;
