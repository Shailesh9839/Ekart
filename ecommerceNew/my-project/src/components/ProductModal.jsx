import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { X, Star, Heart, Plus, Minus, ShoppingBag } from 'lucide-react'

const ProductModal = () => {
  const { 
    quickViewProduct, 
    closeQuickView, 
    addToCart, 
    toggleWishlist, 
    wishlist 
  } = useContext(ShopContext)

  const [qty, setQty] = useState(1)
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('Charcoal')

  if (!quickViewProduct) return null

  const product = quickViewProduct
  const isWishlisted = wishlist.some(item => item.id === product.id)
  const finalPrice = product.price * (1 - (product.discount || 0) / 100)

  const handleAddToCart = () => {
    const options = {}
    if (product.category === 'Fashion') {
      options.size = selectedSize
      options.color = selectedColor
    }
    addToCart(product.id, qty, options)
    closeQuickView()
    // Reset defaults
    setQty(1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      
      {/* Backdrop */}
      <div 
        onClick={closeQuickView}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      ></div>

      {/* Modal Window Container */}
      <div className="relative z-10 w-full max-w-3xl mx-4 bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] md:max-h-[85vh] animate-slide-up">
        
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          className="absolute top-4 right-4 z-20 p-1.5 bg-white/80 hover:bg-white text-slate-400 hover:text-slate-700 rounded-full border border-slate-100 shadow-xs transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Product Image */}
        <div className="w-full md:w-1/2 bg-slate-50 relative aspect-square md:aspect-auto">
          {product.discount > 0 && (
            <span className="absolute top-4 left-4 z-10 bg-red-500 text-white text-3xs font-extrabold px-2.5 py-1 rounded-full">
              -{product.discount}% OFF
            </span>
          )}
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover" 
          />
        </div>

        {/* Right Side: Product Details & Controls */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          
          <div className="space-y-4">
            
            {/* Category */}
            <span className="text-3xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
              {product.category}
            </span>

            {/* Name */}
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
              {product.name}
            </h2>

            {/* Stars */}
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <span className="text-xs font-bold text-slate-700">{product.rating}</span>
              <span className="text-3xs text-slate-400">({product.reviewsCount} verified reviews)</span>
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-2 pb-3 border-b border-slate-100">
              <span className="text-2xl font-black text-slate-900">
                ${finalPrice.toFixed(2)}
              </span>
              {product.discount > 0 && (
                <span className="text-sm text-slate-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 md:line-clamp-4">
              {product.description}
            </p>

            {/* Interactive Options Pickers (For Fashion) */}
            {product.category === 'Fashion' && (
              <div className="space-y-3 pt-2">
                
                {/* Size picker */}
                <div className="space-y-1.5">
                  <span className="text-2xs font-extrabold uppercase tracking-wider text-slate-400">Select Size:</span>
                  <div className="flex gap-2">
                    {['S', 'M', 'L', 'XL'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-9 h-9 rounded-lg text-xs font-bold transition-all border ${
                          selectedSize === size
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color picker */}
                <div className="space-y-1.5">
                  <span className="text-2xs font-extrabold uppercase tracking-wider text-slate-400">Select Color:</span>
                  <div className="flex gap-2">
                    {['Charcoal', 'Slate', 'White'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-all border ${
                          selectedColor === color
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Action Row */}
          <div className="space-y-4 pt-6 mt-6 border-t border-slate-100">
            <div className="flex items-center justify-between gap-4">
              
              {/* Quantity Incrementor */}
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                <button
                  onClick={() => setQty(prev => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:text-slate-800 text-slate-400 transition-all"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-slate-800">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(prev => prev + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:text-slate-800 text-slate-400 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 rounded-xl border transition-colors flex items-center justify-center ${
                  isWishlisted
                    ? 'border-red-100 bg-red-50 text-red-500'
                    : 'border-slate-200 hover:border-slate-400 text-slate-400 hover:text-slate-600'
                }`}
                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
              </button>

            </div>

            {/* Add and Full Details Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add {qty} Item{qty > 1 ? 's' : ''} to Cart</span>
              </button>
              
              <Link
                to={`/product/${product.id}`}
                onClick={closeQuickView}
                className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-2xs font-bold text-center transition-colors block"
              >
                View Full Details
              </Link>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default ProductModal
