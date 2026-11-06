import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { Star, Heart, Eye, ShoppingCart } from 'lucide-react'

const ProductCard = ({ product }) => {
  const { toggleWishlist, wishlist, addToCart, openQuickView } = useContext(ShopContext)

  const isWishlisted = wishlist.some(item => item.id === product.id)
  
  // Calculate final price with discount
  const finalPrice = product.price * (1 - (product.discount || 0) / 100)

  const handleWishlistClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product.id)
  }

  const handleQuickViewClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    openQuickView(product)
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Defaults size to first index or standard for quick buy
    const defaultOptions = product.category === 'Fashion' ? { size: 'M' } : {}
    addToCart(product.id, 1, defaultOptions)
  }

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden animate-slide-up">
      
      {/* Product Image Panel */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        
        {/* Discount Badge */}
        {product.discount > 0 && (
          <span className="absolute top-3.5 left-3.5 z-10 bg-red-500 text-white text-3xs font-extrabold px-2 py-0.75 rounded-full shadow-xs">
            -{product.discount}% OFF
          </span>
        )}

        {/* Product Image */}
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover transform group-hover:scale-106 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Hover action overlays */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          
          {/* Wishlist toggle */}
          <button
            onClick={handleWishlistClick}
            className={`p-2.5 rounded-full shadow-md flex items-center justify-center transition-all transform translate-y-3 group-hover:translate-y-0 duration-300 hover:scale-110 ${
              isWishlisted 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-slate-700 hover:text-red-500'
            }`}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart className={`w-4.5 h-4.5 ${isWishlisted ? 'fill-white' : ''}`} />
          </button>

          {/* Quick View trigger */}
          <button
            onClick={handleQuickViewClick}
            className="p-2.5 bg-white text-slate-700 hover:text-indigo-600 rounded-full shadow-md flex items-center justify-center transition-all transform translate-y-3 group-hover:translate-y-0 duration-300 delay-75 hover:scale-110"
            title="Quick View"
          >
            <Eye className="w-4.5 h-4.5" />
          </button>

        </div>
      </div>

      {/* Product Details Panel */}
      <div className="p-4.5 flex-1 flex flex-col justify-between">
        <div>
          
          {/* Category Tag */}
          <span className="text-3xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
            {product.category}
          </span>

          {/* Product Name */}
          <Link to={`/product/${product.id}`} className="block mt-2">
            <h3 className="text-sm font-semibold text-slate-800 hover:text-indigo-600 line-clamp-1 transition-colors leading-tight">
              {product.name}
            </h3>
          </Link>

          {/* Star Ratings */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-700">{product.rating ?? 0}</span>
            <span className="text-3xs text-slate-400">({product.reviewsCount ?? 0} reviews)</span>
          </div>

        </div>

        {/* Product Pricing and Buy button */}
        <div className="flex items-center justify-between mt-4.5 pt-3 border-t border-slate-50">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                ${finalPrice.toFixed(2)}
              </span>
              {product.discount > 0 && (
                <span className="text-xs text-slate-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Instant Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="p-2 bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white rounded-xl transition-all duration-200"
            title="Add to Cart"
          >
            <ShoppingCart className="w-4.5 h-4.5" />
          </button>
        </div>

      </div>

    </div>
  )
}

export default ProductCard
