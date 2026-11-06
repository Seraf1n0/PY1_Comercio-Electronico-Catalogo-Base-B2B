import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './cart/cartContext.tsx'
import { CartFeedbackProvider } from './components/AddToCartFeedback.tsx'
import { AuthProvider } from "./auth/AuthContext";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider> 
      <CartProvider>
        <CartFeedbackProvider>
          <App />
        </CartFeedbackProvider>
      </CartProvider>
    </AuthProvider>   
  </StrictMode>,
)
