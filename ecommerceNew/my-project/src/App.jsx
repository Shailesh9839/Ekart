import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ShopProvider } from './context/ShopContext'

// Layout Elements
import Header from './components/header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import ProductModal from './components/ProductModal'
import NotificationToast from './components/NotificationToast'
import Chatbot from './components/Chatbot'

// Application Pages
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import HelpCenter from './pages/HelpCenter'

const App = () => {
  return (
    <ShopProvider>
      <BrowserRouter>
        
        {/* Sticky Glass Navigation Header */}
        <Header />

        {/* Dynamic Pages viewport */}
        <main className="min-h-[60vh]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/help-center" element={<HelpCenter />} />
          </Routes>
        </main>

        {/* Polished Site Directory Footer */}
        <Footer />

        {/* Global Floating Overlays & Modal Canvas */}
        <CartDrawer />
        <ProductModal />
        <NotificationToast />
        <Chatbot />

      </BrowserRouter>
    </ShopProvider>
  )
}

export default App
