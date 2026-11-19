import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './cart/cartContext.tsx'
import { CartFeedbackProvider } from './components/AddToCartFeedback.tsx'
import { AuthProvider } from "./auth/AuthContext";
import { AnalyticsProvider } from "./analytics/AnalyticsContext";
import { BranchProvider } from "./branch/BranchContext";
import { OrdersProvider } from "./orders/ordersContext";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BranchProvider>
        <AnalyticsProvider>
          <CartProvider>
            <CartFeedbackProvider>
              <OrdersProvider>
                <App />
              </OrdersProvider>
            </CartFeedbackProvider>
          </CartProvider>
        </AnalyticsProvider>
      </BranchProvider>
    </AuthProvider>
  </StrictMode>,
)
