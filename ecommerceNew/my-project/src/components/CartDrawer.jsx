import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { X, Plus, Minus, Trash2, ShoppingBag, CreditCard, Tag } from 'lucide-react'

const CartDrawer = () => {
  const {
    cart,
    cartOpen,
    setCartOpen,
    removeFromCart,
    updateCartQty,
    applyCoupon,
    removeCoupon,
    activeCoupon,
    getSubtotal,
    getDiscountAmount,
    getTotal
  } = useContext(ShopContext)

  const [couponCode, setCouponCode] = useState('')

  if (!cartOpen) return null

  const handleCouponSubmit = (e) => {
    e.preventDefault()
    if (couponCode.trim() !== '') {
      const success = applyCoupon(couponCode)
      if (success) setCouponCode('')
    }
  }

  const subtotal = getSubtotal()
  const discount = getDiscountAmount()
  const total = getTotal()

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      {/* Dark overlay backdrop */}
      <div 
        onClick={() => setCartOpen(false)}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
      ></div>

      {/* Sliding Drawer Container */}
      <div className="relative z-10 w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5.5 h-5.5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Your Cart</h2>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          <button 
            onClick={() => setCartOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4">
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">Your cart is empty</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-[240px]">
                  Looks like you haven't added anything to your cart yet.
                </p>
              </div>
              <button 
                onClick={() => setCartOpen(false)}
                className="btn-primary flex items-center gap-2"
              >
                <span>Continue Shopping</span>
              </button>
            </div>
          ) : (
            /* Cart Items List */
            cart.map((item, index) => {
              const discountedPrice = item.price * (1 - (item.discount || 0) / 100)
              return (
                <div 
                  key={`${item.id}-${index}`}
                  className="flex gap-4 p-3 bg-slate-50 rounded-xl hover:shadow-xs transition-shadow duration-200"
                >
                  {/* Product Thumb */}
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-20 h-20 object-cover rounded-lg bg-white border border-slate-100 flex-shrink-0"
                  />

                  {/* Item Description */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 truncate">
                        {item.name}
                      </h4>
                      
                      {/* Render Selected Options if any */}
                      {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                          {Object.entries(item.selectedOptions).map(([key, val]) => (
                            <span key={key} className="text-3xs text-slate-400 capitalize bg-slate-200/50 px-1.5 py-0.5 rounded font-medium">
                              {key}: {val}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-white border border-slate-200 rounded-md">
                        <button
                          onClick={() => updateCartQty(item.id, item.quantity - 1, item.selectedOptions)}
                          disabled={item.quantity <= 1}
                          className="p-1 hover:text-slate-800 text-slate-400 disabled:opacity-30 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.id, item.quantity + 1, item.selectedOptions)}
                          className="p-1 hover:text-slate-800 text-slate-400 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Item Pricing */}
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-slate-800">
                          ${(discountedPrice * item.quantity).toFixed(2)}
                        </span>
                        {item.discount > 0 && (
                          <div className="text-3xs text-slate-400">
                            <span className="line-through">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id, item.selectedOptions)}
                    className="text-slate-400 hover:text-red-500 p-1 flex-shrink-0 self-start transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Drawer Footer Panel */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-4">
            
            {/* Promo Code Coupon Form */}
            {!activeCoupon ? (
              <form onSubmit={handleCouponSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Discount code (e.g. SAVE20)"
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <Tag className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors"
                >
                  Apply
                </button>
              </form>
            ) : (
              <div className="flex justify-between items-center bg-indigo-50 border border-indigo-100 p-2.5 rounded-lg">
                <div className="flex items-center gap-1.5 text-xs text-indigo-800 font-bold">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Coupon {activeCoupon.code} (-{activeCoupon.discountPercent}%)</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-3xs font-extrabold text-indigo-500 hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-700">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-slate-700">
                  {subtotal - discount > 150 ? 'FREE' : `$${(14.99).toFixed(2)}`}
                </span>
              </div>
              <div className="border-t border-slate-200 my-2 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Estimated Total</span>
                <span className="text-base text-indigo-600">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* CTA Checkout button */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setCartOpen(false)}
                className="flex-1 py-3 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Keep Shopping
              </button>
              <Link
                to="/checkout"
                onClick={() => setCartOpen(false)}
                className="flex-1 py-3 bg-linear-to-tr from-indigo-600 to-indigo-500 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <CreditCard className="w-4 h-4" />
                <span>Go to Checkout</span>
              </Link>
            </div>
            
          </div>
        )}

      </div>
    </div>
  )
}

export default CartDrawer
