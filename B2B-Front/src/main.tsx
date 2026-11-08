import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './cart/cartContext.tsx'
import { CartFeedbackProvider } from './components/AddToCartFeedback.tsx'
import { AuthProvider } from "./auth/AuthContext";
import { AnalyticsProvider } from "./analytics/AnalyticsContext";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AnalyticsProvider>
        <CartProvider>
          <CartFeedbackProvider>
            <App />
          </CartFeedbackProvider>
        </CartProvider>
      </AnalyticsProvider>
    </AuthProvider>
  </StrictMode>,
)
