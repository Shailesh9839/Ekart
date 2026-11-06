import React, { useContext, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ShopContext } from '../../context/ShopContext'
import ProductCard from '../../components/ProductCard'
import { 
  Sparkles, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  FilterX 
} from 'lucide-react'

// Sliding Hero Banner Data
const HERO_SLIDES = [
  {
    id: 1,
    title: "Welcome to Shailesh Store",
    subtitle: "AeroSound Pro Hybrid ANC",
    tagline: "Unmatched noise cancelling, memory foam comfort, and 40 hrs charge.",
    cta: "Shop AeroSound",
    productId: 1,
    gradient: "from-indigo-900 via-indigo-950 to-slate-900",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000&auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    title: "Timeless Heritage Apparel",
    subtitle: "Premium Lambskin Leather",
    tagline: "Quilted shoulders, YKK hardware, and customized antique satin linings.",
    cta: "Explore Jackets",
    productId: 5,
    gradient: "from-amber-950 via-slate-900 to-indigo-950",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000&auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    title: "Minimalist Living Spaces",
    subtitle: "Handmade Ceramic Pottery",
    tagline: "Ribbed matte sand textured stonewares to elevate your modern home.",
    cta: "Browse Decor",
    productId: 7,
    gradient: "from-slate-800 via-zinc-900 to-slate-950",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000&auto=format&fit=crop&q=80"
  }
]

const Home = () => {
  const { products, wishlist } = useContext(ShopContext)
  const [searchParams, setSearchParams] = useSearchParams()
  
  // States
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy] = useState('popularity') // popularity, price-asc, price-desc
  
  // Read query parameters
  const searchQuery = searchParams.get('search') || ''
  const filterParam = searchParams.get('filter') || ''
  const categoryParam = searchParams.get('category') || ''

  // Sync Category tab with URL query parameter
  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam)
    } else {
      setActiveCategory('All')
    }
  }, [categoryParam])

  // Sync auto-slide timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [])

  // Filter & Sort Products
  let displayedProducts = [...products]

  // 1. Search Query filtering
  if (searchQuery) {
    displayedProducts = displayedProducts.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // 2. Wishlist filter
  if (filterParam === 'wishlist') {
    displayedProducts = displayedProducts.filter(p => 
      wishlist.some(w => w.id === p.id)
    )
  }

  // 3. Category Tab filtering
  if (activeCategory !== 'All') {
    displayedProducts = displayedProducts.filter(p => p.category === activeCategory)
  }

  // 4. Sorting logic
  displayedProducts.sort((a, b) => {
    const aPrice = a.price * (1 - (a.discount || 0) / 100)
    const bPrice = b.price * (1 - (b.discount || 0) / 100)

    if (sortBy === 'price-asc') {
      return aPrice - bPrice
    } else if (sortBy === 'price-desc') {
      return bPrice - aPrice
    } else {
      // Sort by rating (popularity)
      return b.rating - a.rating
    }
  })

  // Handlers
  const handleCategoryClick = (category) => {
    setActiveCategory(category)
    // Clear other search parameters to prevent conflicting states
    setSearchParams(category === 'All' ? {} : { category })
  }

  const handleClearSearch = () => {
    setSearchParams({})
    setActiveCategory('All')
  }

  const categories = ['All', 'Electronics', 'Fashion', 'Home Decor', 'Outdoor']

  return (
    <div className="space-y-16 animate-fade-in pb-12">
      
      {/* Sliding Hero Carousel */}
      <section className="relative overflow-hidden bg-slate-950 md:h-[480px] lg:h-[520px] text-white flex items-center shadow-lg">
        {/* Banner Images Carousel */}
        <div className="absolute inset-0 z-0">
          {HERO_SLIDES.map((slide, idx) => (
            <div 
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? 'opacity-30' : 'opacity-0 pointer-events-none'
              }`}
            >
              <img 
                src={slide.image} 
                alt={slide.title} 
                className="w-full h-full object-cover object-center transform scale-102 filter blur-2xs" 
              />
              {/* Gradient tint */}
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-85`}></div>
            </div>
          ))}
        </div>

        {/* Carousel Content */}
        <div className="custom-container relative z-10 w-full py-16 md:py-0">
          <div className="max-w-2xl space-y-6">
            
            {/* Tagline Accent */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NEW COLLECTION DEBUT</span>
            </div>

            {/* Slider Content Block */}
            {HERO_SLIDES.map((slide, idx) => {
              if (idx !== currentSlide) return null
              return (
                <div key={slide.id} className="space-y-4 animate-slide-up">
                  <h3 className="text-sm font-extrabold tracking-wider uppercase text-slate-300">
                    {slide.subtitle}
                  </h3>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-lg">
                    {slide.tagline}
                  </p>
                  
                  <div className="pt-4">
                    <a 
                      href={`/product/${slide.productId}`}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all hover:scale-103"
                    >
                      <span>{slide.cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )
            })}

          </div>
        </div>

        {/* Slider Nav Controls */}
        <div className="absolute bottom-6 right-6 z-10 flex gap-2">
          <button 
            onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex gap-2.5">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-6 bg-amber-400' : 'w-2 bg-white/30'
              }`}
            ></button>
          ))}
        </div>

      </section>

      {/* Main Browse Section */}
      <section className="custom-container space-y-8">
        
        {/* Filtering & Sorting Header Panel */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-6 border-b border-slate-100">
          
          {/* Section Info */}
          <div>
            {searchQuery ? (
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Search Results for "{searchQuery}"
                </h2>
                <p className="text-xs text-slate-400 mt-1">Found {displayedProducts.length} items</p>
              </div>
            ) : filterParam === 'wishlist' ? (
              <div>
                <h2 className="text-xl font-bold text-slate-800">My Favorites</h2>
                <p className="text-xs text-slate-400 mt-1">{displayedProducts.length} wishlisted items</p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-slate-800">Explore Collections</h2>
                <p className="text-xs text-slate-400 mt-1">Curated list of premium items</p>
              </div>
            )}
          </div>

          {/* Filtering Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-4 py-2 text-xs font-bold rounded-full border transition-all ${
                  activeCategory === category && !filterParam
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-lg px-3 py-1.8 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="popularity">Popularity (Rating)</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

        </div>

        {/* Clear filters banner if searching or wishlisting */}
        {(searchQuery || filterParam === 'wishlist') && (
          <div className="flex justify-between items-center bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
            <span className="text-xs text-indigo-800 font-medium">
              You are currently viewing active search or favorited filters.
            </span>
            <button
              onClick={handleClearSearch}
              className="text-xs font-bold text-indigo-600 hover:text-red-500 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Products Grid Showcase */}
        {displayedProducts.length === 0 ? (
          /* Empty product state */
          <div className="py-24 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <FilterX className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">No products found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                We couldn't find any products matching your active filters. Try clearing search keywords or choosing another category!
              </p>
            </div>
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </section>

      {/* Trust Highlights Section */}
      <section className="bg-slate-100/60 py-16 border-y border-slate-100">
        <div className="custom-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Free Express Delivery</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Complimentary priority shipping on all orders over $150. Packaged beautifully and tracked directly to your home.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">30-Day Easy Returns</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Not quite in love with your purchase? Send it back in original packaging within 30 days for a hassle-free instant refund.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">100% Secure Checkout</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Shop with confidence. All transactions are fully encrypted with AES-256 protocols protecting your credit cards details.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}

export default Home
