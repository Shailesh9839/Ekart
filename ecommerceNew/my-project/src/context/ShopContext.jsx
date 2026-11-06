import React, { createContext, useState, useEffect } from 'react'

export const ShopContext = createContext()

// 12 Premium Products across 4 Categories with beautiful Unsplash URLs
const INITIAL_PRODUCTS = [
  // CATEGORY: ELECTRONICS
  {
    id: 1,
    name: "AeroSound Pro Headphones",
    category: "Electronics",
    price: 249.99,
    rating: 4.8,
    reviewsCount: 124,
    discount: 15, // 15% off
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    description: "Experience premium sound with our advanced hybrid active noise cancelling technology. Soft memory foam ear cups and a lightweight headband provide long-lasting comfort, while smart sensors automatically pause your music when headphones are taken off.",
    specs: {
      "Battery Life": "Up to 40 Hours",
      "Bluetooth Version": "5.2 LE",
      "Noise Cancellation": "Active Hybrid (ANC)",
      "Charging Port": "USB-C Fast Charge",
      "Weight": "250g"
    },
    inStock: 8
  },
  {
    id: 2,
    name: "VeloTime Smart Watch S3",
    category: "Electronics",
    price: 189.99,
    rating: 4.6,
    reviewsCount: 98,
    discount: 0,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    description: "Stay connected, active, and healthy. Features a high-definition AMOLED always-on display, 24/7 heart rate monitoring, advanced sleep analysis, GPS tracking, and a premium waterproof metal body with interchangeable fluoroelastomer straps.",
    specs: {
      "Display": "1.43-inch AMOLED",
      "Water Resistance": "5 ATM / 50m",
      "Battery Life": "Up to 10 Days",
      "Sensors": "Heart Rate, SpO2, Accelerometer, Gyroscope"
    },
    inStock: 12
  },
  {
    id: 3,
    name: "KeyCraft Mechanical Keyboard",
    category: "Electronics",
    price: 129.99,
    rating: 4.9,
    reviewsCount: 76,
    discount: 10,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    description: "A compact 75% hot-swappable mechanical keyboard designed for coders and creators. Features premium tactile brown switches, double-shot PBT keycaps, customized sound-dampening foam layers, and stunning RGB backlighting with multiple dynamic modes.",
    specs: {
      "Form Factor": "75% Compact Layout",
      "Switch Type": "Hot-swappable Tactile Brown",
      "Keycaps": "Double-shot PBT Cherry Profile",
      "Connectivity": "USB-C, 2.4Ghz Wireless, Bluetooth 5.0"
    },
    inStock: 5
  },

  // CATEGORY: FASHION
  {
    id: 4,
    name: "Urban Knit Oversized Hoodie",
    category: "Fashion",
    price: 79.99,
    rating: 4.5,
    reviewsCount: 142,
    discount: 20,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80",
    description: "An ultra-soft heavy fleece hoodie featuring a relaxed dropped-shoulder silhouette, premium embroidered front detailing, double-lined spacious hood, and ribbed cuffs. Designed to stay plush and vibrant wash after wash.",
    specs: {
      "Material": "80% Organic Cotton, 20% Recycled Polyester",
      "Fit": "Relaxed Oversized Silhouette",
      "Weight": "450 GSM Heavyweight Fleece",
      "Care Instructions": "Machine wash cold, lay flat to dry"
    },
    inStock: 15
  },
  {
    id: 5,
    name: "Heritage Leather Jacket",
    category: "Fashion",
    price: 299.99,
    rating: 4.7,
    reviewsCount: 64,
    discount: 0,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80",
    description: "A timeless masterpiece crafted from top-grain buttery soft lambskin leather. Features customized antique silver zippers, quilted shoulder panels, adjustable waist side tabs, and a sleek silky lining. The jacket matures and develops a unique character over time.",
    specs: {
      "Shell Material": "100% Top-grain Lambskin Leather",
      "Lining Material": "100% Premium Satin Polyester",
      "Hardware": "Heavy-duty YKK Zippers",
      "Pockets": "3 Exterior Zip, 2 Interior Slip"
    },
    inStock: 3
  },
  {
    id: 6,
    name: "Nimbus Cushion Runner Sneakers",
    category: "Fashion",
    price: 119.99,
    rating: 4.4,
    reviewsCount: 188,
    discount: 5,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    description: "Step onto the clouds. Engineered with breathable engineered knit uppers, responsive nitrogen-infused foam midsoles, and high-abrasion slip-resistant rubber outsoles. Delivers unmatched bounce and joint protection for running or daily commutes.",
    specs: {
      "Upper": "Engineered Breathable Mesh",
      "Midsole": "Supercritical Nitrogen-infused Foam",
      "Outsole": "Duragrip Rubber",
      "Drop": "8mm Heel-to-Toe Drop"
    },
    inStock: 20
  },

  // CATEGORY: HOME DECOR
  {
    id: 7,
    name: "Aura Ceramic Vase Set",
    category: "Home Decor",
    price: 49.99,
    rating: 4.7,
    reviewsCount: 53,
    discount: 0,
    image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&auto=format&fit=crop&q=80",
    description: "A trio of hand-finished ribbed ceramic vases with a modern matte sandy-textured glaze. Featuring diverse shapes, they look exquisite styled together with dried pampas grass, fresh stems, or displayed alone as minimal sculptural objects.",
    specs: {
      "Material": "100% Hand-crafted Stoneware Ceramic",
      "Finish": "Sand-textured Matte Glaze",
      "Vase heights": "Small (12cm), Medium (18cm), Large (24cm)",
      "Waterproof": "Yes, completely glazed inside"
    },
    inStock: 14
  },
  {
    id: 8,
    name: "Lunar Brass Desk Lamp",
    category: "Home Decor",
    price: 89.99,
    rating: 4.8,
    reviewsCount: 45,
    discount: 15,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
    description: "Illuminate your desk with mid-century elegance. Made with a heavy marble circular base, solid brass rotating arm, and a beautiful frosted opal glass spherical shade that diffuses light softly to reduce eye fatigue.",
    specs: {
      "Base Material": "Genuine White Carrara Marble",
      "Structure Material": "Polished Solid Brass",
      "Shade": "Frosted Opal Glass",
      "Bulb Included": "G9 LED bulb, 3000K Warm White"
    },
    inStock: 6
  },
  {
    id: 9,
    name: "Amber Santal Scented Candle",
    category: "Home Decor",
    price: 24.99,
    rating: 4.6,
    reviewsCount: 112,
    discount: 0,
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop&q=80",
    description: "Fill your sanctuary with cozy, rich notes of sandalwood, glowing warm amber, spicy cardamom, and fresh leather. Hand-poured in a dark amber glass jar with a premium crackling wooden wick that burns slowly and evenly.",
    specs: {
      "Wax Blend": "100% Natural Organic Soy Wax",
      "Burn Time": "Approximately 55-60 Hours",
      "Wick Type": "Single Sustainable Wooden Crackle Wick",
      "Fragrance Notes": "Sandalwood, Amber, Cardamom, Leather, Musk"
    },
    inStock: 30
  },

  // CATEGORY: OUTDOOR
  {
    id: 10,
    name: "Apex 40L Waterproof Backpack",
    category: "Outdoor",
    price: 139.99,
    rating: 4.9,
    reviewsCount: 84,
    discount: 10,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    description: "Engineered for rugged environments. Crafted from military-grade high-density ripstop nylon with waterproof TPU coatings, heat-sealed seams, roll-top closure, and ergonomic padded harness straps. Includes a dedicated padded compartment for a 16-inch laptop.",
    specs: {
      "Capacity": "40 Liters",
      "Material": "1000D Cordura Ripstop Nylon with TPU Coated Backing",
      "Waterproofing Class": "IPX6 (Resists high-pressure heavy spray)",
      "Laptop Sleeve": "Fits up to 16\" MacBook Pro"
    },
    inStock: 9
  },
  {
    id: 11,
    name: "Summit Dome 3-Person Tent",
    category: "Outdoor",
    price: 219.99,
    rating: 4.7,
    reviewsCount: 39,
    discount: 0,
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=80",
    description: "A lightweight, double-walled 3-season tent that pitches in under 5 minutes. Features ultra-strong aviation aluminium poles, waterproof rainfly with fully taped seams, dual entry doors, vestibules, and mesh micro-windows for excellent ventilation.",
    specs: {
      "Capacity": "3 Adults",
      "Packed Weight": "2.8 kg",
      "Rainfly Material": "20D Ripstop Nylon, 3000mm Polyurethane waterproof rating",
      "Poles": "DAC Featherlite Aviation Aluminium"
    },
    inStock: 4
  },
  {
    id: 12,
    name: "ThermaFlow Vacuum Flask",
    category: "Outdoor",
    price: 34.99,
    rating: 4.8,
    reviewsCount: 165,
    discount: 10,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80",
    description: "Keep hydration at the perfect temperature. Double-walled vacuum insulation keeps drinks ice cold for up to 24 hours, or piping hot for up to 12 hours. Sleek sweat-free powder coat finish with a leakproof insulated flex lid.",
    specs: {
      "Capacity": "950ml (32 oz)",
      "Material": "Professional-grade 18/8 Stainless Steel",
      "Insulation": "TempShield Double-wall Vacuum",
      "BPA Free": "Yes, absolutely"
    },
    inStock: 25
  }
]

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS)
  const [cart, setCart] = useState(() => {
    const localData = localStorage.getItem('vibeCart_cart')
    return localData ? JSON.parse(localData) : []
  })
  const [wishlist, setWishlist] = useState(() => {
    const localData = localStorage.getItem('vibeCart_wishlist')
    return localData ? JSON.parse(localData) : []
  })
  const [cartOpen, setCartOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [activeCoupon, setActiveCoupon] = useState(null) // { code: 'SAVE20', discountPercent: 20 }
  const [notifications, setNotifications] = useState([])

  // Mock reviews database per product (keyed by product ID)
  const [productReviews, setProductReviews] = useState({
    1: [
      { id: 101, user: "Alex Mercer", rating: 5, date: "May 12, 2026", comment: "Absolutely incredible! The active noise cancelling is as good as the market leaders. Comfort is top notch." },
      { id: 102, user: "Sarah Jenkins", rating: 4, date: "April 28, 2026", comment: "Stunning audio quality. Bass is punchy but clean. Battery holds up perfectly for long flights." }
    ]
  })

  // Synchronize cart and wishlist to local storage
  useEffect(() => {
    localStorage.setItem('vibeCart_cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem('vibeCart_wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  // Fetch products from backend API, with fallback to static products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        }
      } catch (err) {
        console.warn('Backend API products unavailable, falling back to static products.', err)
      }
    }
    fetchProducts()
  }, [])

  // Custom alert notifications trigger
  const showNotification = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9)
    setNotifications((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 4000)
  }

  // Cart operations
  const addToCart = (productId, qty = 1, options = {}) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(item => 
        item.id === productId && 
        JSON.stringify(item.selectedOptions) === JSON.stringify(options)
      )

      if (existingIdx > -1) {
        const newCart = [...prevCart]
        const newQty = newCart[existingIdx].quantity + qty
        if (newQty > product.inStock) {
          showNotification(`Only ${product.inStock} items are available in stock.`, 'warning')
          newCart[existingIdx].quantity = product.inStock
        } else {
          newCart[existingIdx].quantity = newQty
          showNotification(`Updated ${product.name} quantity in your cart!`, 'success')
        }
        return newCart
      } else {
        if (qty > product.inStock) {
          showNotification(`Only ${product.inStock} items are available. Adding max stock.`, 'warning')
          qty = product.inStock
        } else {
          showNotification(`${product.name} added to cart!`, 'success')
        }
        return [...prevCart, { ...product, quantity: qty, selectedOptions: options }]
      }
    })
  }

  const removeFromCart = (productId, options = {}) => {
    setCart((prevCart) => {
      const updated = prevCart.filter(item => 
        !(item.id === productId && JSON.stringify(item.selectedOptions) === JSON.stringify(options))
      )
      showNotification("Item removed from your cart.", "info")
      return updated
    })
  }

  const updateCartQty = (productId, qty, options = {}) => {
    const product = products.find(p => p.id === productId)
    if (!product || qty < 1) return

    if (qty > product.inStock) {
      showNotification(`Sorry, only ${product.inStock} items in stock.`, "warning")
      qty = product.inStock
    }

    setCart((prevCart) => {
      return prevCart.map(item => {
        if (item.id === productId && JSON.stringify(item.selectedOptions) === JSON.stringify(options)) {
          return { ...item, quantity: qty }
        }
        return item
      })
    })
  }

  const clearCart = () => {
    setCart([])
  }

  // Wishlist toggle
  const toggleWishlist = (productId) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    setWishlist((prevWishlist) => {
      const isWishlisted = prevWishlist.some(item => item.id === productId)
      if (isWishlisted) {
        showNotification(`Removed ${product.name} from wishlist.`, "info")
        return prevWishlist.filter(item => item.id !== productId)
      } else {
        showNotification(`Added ${product.name} to wishlist!`, "success")
        return [...prevWishlist, product]
      }
    })
  }

  // Quick view popup modal management
  const openQuickView = (product) => {
    setQuickViewProduct(product)
  }

  const closeQuickView = () => {
    setQuickViewProduct(null)
  }

  // Coupon codes application
  const applyCoupon = (code) => {
    const cleanCode = code.trim().toUpperCase()
    if (cleanCode === 'SAVE20') {
      setActiveCoupon({ code: 'SAVE20', discountPercent: 20 })
      showNotification("Coupon 'SAVE20' applied! 20% discount added.", "success")
      return true
    } else if (cleanCode === 'FREESHIP') {
      setActiveCoupon({ code: 'FREESHIP', discountPercent: 10 })
      showNotification("Coupon 'FREESHIP' applied! 10% discount added.", "success")
      return true
    } else {
      showNotification("Invalid discount code. Try 'SAVE20'.", "error")
      return false
    }
  }

  const removeCoupon = () => {
    setActiveCoupon(null)
    showNotification("Coupon removed.", "info")
  }

  // Add review to a product dynamically
  const addProductReview = (productId, review) => {
    const newReview = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ...review
    }
    setProductReviews((prev) => ({
      ...prev,
      [productId]: [...(prev[productId] || []), newReview]
    }))
    showNotification("Thank you for your review!", "success")
  }

  // Financial calculations
  const getSubtotal = () => {
    return cart.reduce((acc, item) => {
      const price = item.price * (1 - (item.discount || 0) / 100)
      return acc + (price * item.quantity)
    }, 0)
  }

  const getDiscountAmount = () => {
    if (!activeCoupon) return 0
    return getSubtotal() * (activeCoupon.discountPercent / 100)
  }

  const getTaxAmount = () => {
    return (getSubtotal() - getDiscountAmount()) * 0.08 // 8% sales tax
  }

  const getShippingCost = () => {
    const sub = getSubtotal() - getDiscountAmount()
    if (sub > 150 || sub === 0) return 0 // Free shipping over $150
    return 14.99
  }

  const getTotal = () => {
    const base = getSubtotal() - getDiscountAmount()
    return base + getTaxAmount() + getShippingCost()
  }

  return (
    <ShopContext.Provider
      value={{
        products,
        cart,
        wishlist,
        cartOpen,
        setCartOpen,
        quickViewProduct,
        openQuickView,
        closeQuickView,
        activeCoupon,
        applyCoupon,
        removeCoupon,
        notifications,
        showNotification,
        productReviews,
        addProductReview,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        toggleWishlist,
        getSubtotal,
        getDiscountAmount,
        getTaxAmount,
        getShippingCost,
        getTotal
      }}
    >
      {children}
    </ShopContext.Provider>
  )
}
