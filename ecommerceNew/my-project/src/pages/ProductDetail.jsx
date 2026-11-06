import React, { useContext, useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import ProductCard from '../components/ProductCard'
import { 
  Star, 
  Heart, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ChevronRight, 
  ShieldAlert, 
  Check, 
  MessageSquare,
  Sparkles
} from 'lucide-react'

const ProductDetail = () => {
  const { id } = useParams()
  const { 
    products, 
    addToCart, 
    toggleWishlist, 
    wishlist, 
    productReviews, 
    addProductReview 
  } = useContext(ShopContext)

  // Find product
  const product = products.find(p => p.id === parseInt(id))
  
  if (!product) {
    return (
      <div className="custom-container py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-slate-400 mt-2">The product you are trying to view does not exist or has been removed.</p>
        <Link to="/" className="btn-primary mt-6 inline-block">Back to Shop Home</Link>
      </div>
    )
  }

  // Gallery images mock (main image, detail zoom unsplash image, package unsplash image)
  const galleryImages = [
    product.image,
    `${product.image}&auto=format&fit=crop&w=400&h=400&q=60`,
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80" // box package mockup
  ]

  // States
  const [activeImg, setActiveImg] = useState(product.image)
  const [qty, setQty] = useState(1)
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('Charcoal')
  const [activeTab, setActiveTab] = useState('description') // description, specs, reviews
  
  // Review form states
  const [reviewName, setReviewName] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')

  // Sync active image when product ID changes
  useEffect(() => {
    setActiveImg(product.image)
    setQty(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [product])

  const isWishlisted = wishlist.some(item => item.id === product.id)
  const finalPrice = product.price * (1 - (product.discount || 0) / 100)

  const handleAddToCart = () => {
    const options = {}
    if (product.category === 'Fashion') {
      options.size = selectedSize
      options.color = selectedColor
    }
    addToCart(product.id, qty, options)
  }

  const handleReviewSubmit = (e) => {
    e.preventDefault()
    if (reviewName.trim() === '' || reviewComment.trim() === '') return
    
    addProductReview(product.id, {
      user: reviewName,
      rating: reviewRating,
      comment: reviewComment
    })

    // Reset form
    setReviewName('')
    setReviewRating(5)
    setReviewComment('')
  }

  // Find related products (exclude current)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  // Get active reviews list (fallback to empty list)
  const reviews = productReviews[product.id] || []

  return (
    <div className="space-y-16 animate-fade-in py-8">
      <div className="custom-container">
        
        {/* Breadcrumbs Path */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium pb-6">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-indigo-600 transition-colors">
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-600 truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Core Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Side: Product Images Gallery */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Active big Image */}
            <div className="aspect-square bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden shadow-xs relative">
              {product.discount > 0 && (
                <span className="absolute top-4 left-4 z-10 bg-red-500 text-white text-3xs font-extrabold px-3 py-1 rounded-full">
                  -{product.discount}% OFF
                </span>
              )}
              <img 
                src={activeImg} 
                alt={product.name} 
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            {/* Thumbnails list */}
            <div className="grid grid-cols-3 gap-4">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(img)}
                  className={`aspect-square bg-slate-50 border rounded-2xl overflow-hidden transition-all ${
                    activeImg === img
                      ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

          </div>

          {/* Right Side: Specifications and Buy Controls */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              
              {/* Category Tag */}
              <span className="text-3xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.75 rounded-md">
                {product.category}
              </span>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating stars & counts */}
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <span className="text-xs font-bold text-slate-700">{product.rating}</span>
                <button 
                  onClick={() => {
                    setActiveTab('reviews')
                    const el = document.getElementById('details-tabs-panel')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }} 
                  className="text-3xs text-indigo-500 hover:text-indigo-600 font-bold border-b border-indigo-200"
                >
                  ({reviews.length + 5} reviews)
                </button>
              </div>

              {/* Price Panel */}
              <div className="flex items-baseline gap-2.5 py-4 border-y border-slate-100">
                <span className="text-3xl font-black text-slate-900">
                  ${finalPrice.toFixed(2)}
                </span>
                {product.discount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-3xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                      Save ${(product.price - finalPrice).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 leading-relaxed">
                {product.description}
              </p>

              {/* Options Selection (Fashion category size/colors selectors) */}
              {product.category === 'Fashion' && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  
                  {/* Size Selector */}
                  <div className="space-y-2">
                    <span className="text-3xs font-bold uppercase tracking-wider text-slate-400">Select Size:</span>
                    <div className="flex gap-2.5">
                      {['S', 'M', 'L', 'XL'].map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`w-10 h-10 rounded-xl text-xs font-bold transition-all border ${
                            selectedSize === size
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors Selector */}
                  <div className="space-y-2">
                    <span className="text-3xs font-bold uppercase tracking-wider text-slate-400">Select Color:</span>
                    <div className="flex gap-2">
                      {['Charcoal', 'Slate', 'White'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-3.5 py-1.8 rounded-xl text-2xs font-bold transition-all border ${
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

            {/* Quantity selection & Buy buttons */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              
              <div className="flex items-center justify-between gap-4">
                
                {/* Quantity adjustments */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1 flex-1 max-w-[140px]">
                  <button
                    onClick={() => setQty(prev => Math.max(1, prev - 1))}
                    className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white hover:text-slate-800 text-slate-400 transition-all"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="flex-1 text-center text-sm font-bold text-slate-800">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(prev => prev + 1)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white hover:text-slate-800 text-slate-400 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3 rounded-xl border transition-colors flex items-center justify-center ${
                    isWishlisted
                      ? 'border-red-100 bg-red-50 text-red-500 shadow-sm'
                      : 'border-slate-200 hover:border-slate-400 text-slate-400 hover:text-slate-600'
                  }`}
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
                </button>

              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                className="w-full btn-primary py-4 text-xs font-bold flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                <span>Add {qty} Item{qty > 1 ? 's' : ''} to Cart</span>
              </button>

              {/* Stock Notice Info */}
              <div className="flex items-center gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/50 text-2xs font-semibold text-slate-500">
                <ShieldAlert className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span>Authorized retail brand warranty. Free delivery on orders over $150.</span>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Tabs Specifications and Review Area */}
      <section id="details-tabs-panel" className="custom-container border-t border-slate-100 pt-16">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          
          {/* Tab Navigation header */}
          <div className="flex bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-6 py-4 transition-colors ${
                activeTab === 'description' 
                  ? 'bg-white text-indigo-600 border-t-2 border-indigo-500' 
                  : 'hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              Description & Details
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-6 py-4 transition-colors ${
                activeTab === 'specs' 
                  ? 'bg-white text-indigo-600 border-t-2 border-indigo-500' 
                  : 'hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              Technical Specs
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-4 transition-colors ${
                activeTab === 'reviews' 
                  ? 'bg-white text-indigo-600 border-t-2 border-indigo-500' 
                  : 'hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="p-6 md:p-8 text-xs text-slate-600 leading-relaxed">
            
            {activeTab === 'description' && (
              <div className="space-y-4 max-w-3xl">
                <h3 className="text-sm font-bold text-slate-800">Elevated Quality, Curated Details</h3>
                <p>{product.description}</p>
                <p>Every purchase includes original branded retail boxing, manuals, and accessories. Designed with environmental sustainability and premium luxury in mind, this product embodies state-of-the-art consumer engineering.</p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <div className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center"><Check className="w-3.5 h-3.5" /></div>
                    <span>1-Year Retailing Warranty</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <div className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center"><Check className="w-3.5 h-3.5" /></div>
                    <span>Premium Materials Build</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-2xl">
                <table className="w-full border-collapse">
                  <tbody>
                    {Object.entries(product.specs || {}).map(([key, val]) => (
                      <tr key={key} className="border-b border-slate-100">
                        <td className="py-3 pr-4 font-bold text-slate-800 w-1/3">{key}</td>
                        <td className="py-3 text-slate-500">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Active Reviews Listing */}
                <div className="lg:col-span-7 space-y-6">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    <span>Customer Comments</span>
                  </h3>

                  {reviews.length === 0 ? (
                    <div className="bg-slate-50 p-6 rounded-2xl text-center text-slate-400">
                      Be the first to review this product!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800">{rev.user}</span>
                            <span className="text-3xs font-medium text-slate-400">{rev.date}</span>
                          </div>
                          
                          {/* Stars */}
                          <div className="flex text-amber-400 gap-0.5">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                            ))}
                          </div>

                          <p className="text-xs text-slate-500 leading-normal">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Post review interactive form */}
                <div className="lg:col-span-5 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-4">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Leave a Review</span>
                  </h3>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-3xs font-bold uppercase text-slate-500">Your Name</label>
                      <input
                        type="text"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="Enter Name"
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>

                    {/* Rating Select */}
                    <div className="space-y-1.5">
                      <label className="text-3xs font-bold uppercase text-slate-500">Rating Rating</label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(parseInt(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 - Perfect)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                        <option value={3}>⭐⭐⭐ (3 - Average)</option>
                        <option value={2}>⭐⭐ (2 - Poor)</option>
                        <option value={1}>⭐ (1 - Terrible)</option>
                      </select>
                    </div>

                    {/* Comments */}
                    <div className="space-y-1.5">
                      <label className="text-3xs font-bold uppercase text-slate-500">Comment Details</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        rows={4}
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      Submit Review
                    </button>
                    
                  </form>
                </div>

              </div>
            )}

          </div>

        </div>
      </section>

      {/* Related Products Showcase */}
      {relatedProducts.length > 0 && (
        <section className="custom-container space-y-6">
          <h2 className="text-lg font-extrabold text-slate-800">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  )
}

export default ProductDetail
