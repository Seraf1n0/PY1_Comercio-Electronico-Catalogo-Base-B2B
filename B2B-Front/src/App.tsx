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
import AlgoliaStatusBanner from "./components/AlgoliaStatusBanner";
import RoleContextBar from "./components/RoleContextBar";
import LoginPage from "./pages/login/LoginPage";
import RequireAuth from "./auth/RequireAuth";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import MyOrdersPage from "./pages/orders/MyOrdersPage";
import OrderDetailPage from "./pages/orders/OrderDetail";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminHomePage from "./pages/admin/AdminHomePage";
import AdminOrderDetailPage from "./pages/admin/AdminOrderDetailPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminInventoryPage from "./pages/admin/AdminInventoryPage";
import RequireRole from "./auth/RequireRole";

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
            <AlgoliaStatusBanner />
                  <RoleContextBar />
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/terminos-y-condiciones" element={<TermsAndConditionsPage />} />

            <Route element={<RequireAuth />}>
              {/* Todos los roles validos */}
              <Route element={<RequireRole permission="catalog.view" />}>
                <Route path="/" element={<SearchPage />} />
                <Route path="/producto/:id" element={<ProductDetailPage />} />
              </Route>

              {/* Solo clientes (B2C / B2B) */}
              <Route element={<RequireRole permission="cart.add" />}>
                <Route path="/carrito" element={<CartPage />} />
              </Route>
              <Route element={<RequireRole permission="checkout" />}>
                <Route path="/finalizar-compra" element={<CheckoutPage />} />
                <Route path="/pago/:orderNumber" element={<PaymentPage />} />
                <Route path="/confirmacion/:orderNumber" element={<ConfirmationPage />} />
              </Route>
              <Route element={<RequireRole permission="orders.own" />}>
                <Route path="/mis-ordenes" element={<MyOrdersPage />} />
                <Route path="/mis-ordenes/:orderNumber" element={<OrderDetailPage />} />
              </Route>

              <Route element={<RequireRole permission="analytics.view" />}>
                <Route path="/analytics" element={<AnalyticsPage />} />
              </Route>

                         {/* Solo ADMIN: panel administrativo con rutas hijas */}
            <Route element={<RequireRole permission="admin.view" />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminHomePage />} />
                <Route path="ordenes" element={<AdminOrdersPage />} />
                <Route path="ordenes/:orderNumber" element={<AdminOrderDetailPage />} />
                <Route path="productos" element={<AdminProductsPage />} />
                <Route path="inventario" element={<AdminInventoryPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <SiteFooter />
      </ErrorBoundary>
    </HashRouter>
  );
}

export default App;
