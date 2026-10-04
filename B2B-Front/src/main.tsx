import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './cart/cartContext.tsx'
import { CartFeedbackProvider } from './components/AddToCartFeedback.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <CartFeedbackProvider>
        <App />
      </CartFeedbackProvider>
    </CartProvider>
  </StrictMode>,
)
