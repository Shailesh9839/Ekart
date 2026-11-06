import React, { useState, useContext, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShopContext } from '../../context/ShopContext'
import { 
  Search, 
  Heart, 
  ShoppingBag, 
  HelpCircle, 
  X, 
  ArrowRight, 
  ChevronRight, 
  Menu
} from 'lucide-react'

const Header = () => {
  const { cart, wishlist, setCartOpen, products } = useContext(ShopContext)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const searchRef = useRef(null)
  const navigate = useNavigate()

  // Filter products by search query
  const suggestions = searchQuery.trim() === '' 
    ? [] 
    : products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5) // Limit to 5 suggestions

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim() !== '') {
      setShowSuggestions(false)
      // Navigate to home page and pass filter query
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSuggestionClick = (productId) => {
    setSearchQuery('')
    setShowSuggestions(false)
    navigate(`/product/${productId}`)
  }

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0)

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top Banner Strip */}
      <div className="bg-slate-900 text-slate-100 py-2 text-xs font-medium">
        <div className="custom-container flex justify-between items-center">
          <p className="flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Use coupon <span className="text-amber-400 font-bold">SAVE20</span> for 20% off all items!
          </p>
          <div className="flex items-center gap-4">
            <Link to="/help-center" className="hover:text-amber-400 flex items-center gap-1 transition-colors">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Help Center</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Glass Header */}
      <div className="glass-header shadow-xs py-4">
        <div className="custom-container flex items-center justify-between gap-4">
          
          {/* Mobile Menu Trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 select-none group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-md transform group-hover:rotate-6 transition-transform">
              S
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800 bg-gradient-to-r from-indigo-600 to-amber-500 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              Shailesh Cart
            </span>
          </Link>

          {/* Dynamic Search Box */}
          <form 
            ref={searchRef} 
            onSubmit={handleSearchSubmit} 
            className="relative hidden md:flex flex-1 max-w-lg items-center"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search products, brands, categories..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-100/80 border border-slate-200 rounded-full text-sm text-slate-800 focus:bg-white placeholder-slate-400 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
              />
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Autocomplete suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 overflow-hidden animate-fade-in z-50">
                <div className="px-4 pb-2 mb-2 border-b border-slate-100 text-xs font-semibold text-slate-400 flex justify-between items-center">
                  <span>PRODUCT SUGGESTIONS</span>
                  <span className="text-indigo-500">Press Enter to search all</span>
                </div>
                <ul>
                  {suggestions.map((product) => {
                    const finalPrice = product.price * (1 - (product.discount || 0) / 100)
                    return (
                      <li key={product.id}>
                        <button
                          type="button"
                          onClick={() => handleSuggestionClick(product.id)}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                        >
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-10 h-10 object-cover rounded-lg bg-slate-100" 
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-slate-800 truncate">{product.name}</h4>
                            <p className="text-xs text-slate-400">{product.category}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-slate-900">${finalPrice.toFixed(2)}</span>
                            {product.discount > 0 && (
                              <p className="text-2xs text-red-500 font-semibold">-{product.discount}%</p>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </form>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-1.5 md:gap-3">
            
            {/* Wishlist Link */}
            <Link 
              to="/?filter=wishlist" 
              className="relative p-2.5 text-slate-700 hover:text-red-500 hover:bg-slate-100 rounded-full transition-all"
              title="Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-3xs font-extrabold shadow-sm animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Drawer Trigger */}
            <button 
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-all"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartItems > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-3xs font-extrabold shadow-sm">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* Help link on Mobile */}
            <Link 
              to="/help-center" 
              className="p-2.5 md:hidden text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <HelpCircle className="w-5 h-5" />
            </Link>

          </nav>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex animate-fade-in">
          <div className="w-4/5 max-w-sm bg-white h-full p-6 shadow-2xl flex flex-col gap-6 animate-slide-in-right">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-slate-900">VibeCart</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm"
              />
              <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
            </form>

            <ul className="flex flex-col gap-4 text-base font-semibold text-slate-700">
              <li>
                <Link 
                  to="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 hover:text-indigo-600 border-b border-slate-50"
                >
                  Shop Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/?filter=wishlist" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 hover:text-indigo-600 border-b border-slate-50 flex justify-between items-center"
                >
                  <span>My Wishlist</span>
                  {wishlist.length > 0 && <span className="bg-red-500 text-white text-3xs px-2 py-0.5 rounded-full">{wishlist.length}</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/help-center" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 hover:text-indigo-600 border-b border-slate-50"
                >
                  FAQ & Help Center
                </Link>
              </li>
            </ul>

            <div className="mt-auto border-t border-slate-100 pt-6">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false)
                  setCartOpen(true)
                }}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>View Cart ({totalCartItems})</span>
              </button>
            </div>
          </div>
          
          {/* Overlay Click closer */}
          <div onClick={() => setMobileMenuOpen(false)} className="flex-1"></div>
        </div>
      )}
    </header>
  )
}

export default Header