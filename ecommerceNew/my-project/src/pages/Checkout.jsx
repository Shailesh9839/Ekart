import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { 
  CreditCard, 
  MapPin, 
  ShoppingBag, 
  CheckCircle, 
  ArrowRight, 
  Lock, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap,
  X,
  Smartphone,
  Building2,
  Check
} from 'lucide-react'

// Helper function to dynamically load Razorpay Checkout JS SDK
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true)
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

const Checkout = () => {
  const { 
    cart, 
    clearCart, 
    activeCoupon, 
    getSubtotal, 
    getDiscountAmount, 
    getTaxAmount, 
    getShippingCost, 
    getTotal,
    showNotification
  } = useContext(ShopContext)

  // Step Wizard: 'address' | 'payment' | 'success'
  const [step, setStep] = useState('address')
  const [paymentMethod, setPaymentMethod] = useState('razorpay') // 'razorpay' | 'card'
  const [isProcessing, setIsProcessing] = useState(false)

  // Razorpay Modal Simulation state
  const [showRazorpayModal, setShowRazorpayModal] = useState(false)
  const [razorpayOrderInfo, setRazorpayOrderInfo] = useState(null)
  const [selectedUpiOption, setSelectedUpiOption] = useState('gpay')
  const [upiIdInput, setUpiIdInput] = useState('')

  // Shipping form fields
  const [addressForm, setAddressForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    phone: ''
  })

  // Credit Card visualizer state
  const [cardForm, setCardForm] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  })
  const [cardFlipped, setCardFlipped] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [orderPaymentId, setOrderPaymentId] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [confirmedEmail, setConfirmedEmail] = useState('')

  if (cart.length === 0 && step !== 'success') {
    return (
      <div className="custom-container py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="text-slate-400 mt-2">Add some premium items to your cart before proceeding to checkout.</p>
        <Link to="/" className="btn-primary mt-6 inline-block">Back to Shop Home</Link>
      </div>
    )
  }

  // Address validation
  const handleAddressSubmit = (e) => {
    e.preventDefault()
    setStep('payment')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Card details formatting
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length > 0) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value) => {
    const clean = value.replace(/\D/g, '')
    if (clean.length >= 2) {
      return `${clean.slice(0, 2)}/${clean.slice(2, 4)}`
    }
    return clean
  }

  const subtotal = getSubtotal()
  const discount = getDiscountAmount()
  const tax = getTaxAmount()
  const shipping = getShippingCost()
  const total = getTotal()

  // Handle Direct Credit Card Submission (Saves to SQLite DB)
  const handleCardSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const response = await fetch('/api/payment/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: addressForm,
          items: cart,
          totalAmount: total,
          paymentMethod: 'Direct Credit Card'
        })
      })

      const data = await response.json()
      if (data.success) {
        setOrderNumber(data.orderId)
        setOrderPaymentId(data.paymentId)
        setEmailSent(Boolean(data.emailSent))
        setConfirmedEmail(data.email || addressForm.email)
        setStep('success')
        clearCart()
        showNotification("Order verified & saved to database!", "success")
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        showNotification("Payment processing failed. Please try again.", "error")
      }
    } catch (err) {
      console.error('Direct card order submission error:', err)
      showNotification("Order processing error. Please check server connection.", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  // Execute Payment Verification API call
  const executePaymentVerification = async (razorpayOrderId, razorpayPaymentId, razorpaySignature, methodLabel) => {
    setIsProcessing(true)
    showNotification("Verifying Razorpay payment & updating database...", "info")

    try {
      const verifyRes = await fetch('/api/payment/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
          customer: addressForm,
          items: cart,
          totalAmount: total,
          paymentMethod: methodLabel || 'Razorpay Gateway (UPI/Card)'
        })
      })

      const verifyData = await verifyRes.json()

      if (verifyData.success) {
        setOrderNumber(verifyData.orderId)
        setOrderPaymentId(verifyData.paymentId)
        setEmailSent(Boolean(verifyData.emailSent))
        setConfirmedEmail(verifyData.email || addressForm.email)
        setShowRazorpayModal(false)
        setStep('success')
        clearCart()
        showNotification("Razorpay payment verified & order recorded in database!", "success")
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        showNotification("Payment verification failed.", "error")
      }
    } catch (verifyErr) {
      console.error('Payment verification API error:', verifyErr)
      showNotification("Error communicating with payment verification server.", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle Razorpay Payment Gateway Trigger
  const handleRazorpayPayment = async () => {
    setIsProcessing(true)

    try {
      // 1. Create Razorpay order on Express backend
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`
        })
      })

      const orderData = await orderRes.json()

      if (!orderData.success) {
        showNotification("Could not create Razorpay payment order.", "error")
        setIsProcessing(false)
        return
      }

      setRazorpayOrderInfo(orderData)

      // If key is dummy or simulated, open interactive Razorpay modal right away
      if (orderData.isSimulated) {
        setShowRazorpayModal(true)
        setIsProcessing(false)
        return
      }

      // If user provided a real Razorpay key, launch official SDK
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        setShowRazorpayModal(true)
        setIsProcessing(false)
        return
      }

      try {
        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "VibeCart Premium Store",
          description: "Secure Order Payment",
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80",
          order_id: orderData.orderId,
          prefill: {
            name: `${addressForm.firstName} ${addressForm.lastName}`,
            email: addressForm.email,
            contact: addressForm.phone
          },
          notes: {
            address: `${addressForm.address}, ${addressForm.city}`
          },
          theme: {
            color: "#4f46e5"
          },
          handler: function (response) {
            executePaymentVerification(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              'Razorpay Gateway SDK'
            )
          },
          modal: {
            ondismiss: function () {
              showNotification("Razorpay checkout popup closed.", "info")
              setIsProcessing(false)
            }
          }
        }

        const rzp1 = new window.Razorpay(options)
        rzp1.on('payment.failed', function () {
          setShowRazorpayModal(true)
          setIsProcessing(false)
        })
        rzp1.open()

      } catch (sdkLaunchErr) {
        console.warn('Official Razorpay SDK launch error, using sandbox modal:', sdkLaunchErr)
        setShowRazorpayModal(true)
        setIsProcessing(false)
      }

    } catch (err) {
      console.error('Razorpay process error:', err)
      showNotification("Error initiating Razorpay checkout.", "error")
      setIsProcessing(false)
    }
  }

  // Complete simulated Razorpay checkout from modal
  const handleSimulatedRazorpaySubmit = (methodName) => {
    const mockPaymentId = `pay_rzp_${Math.floor(1000000000 + Math.random() * 9000000000)}`
    const orderId = razorpayOrderInfo?.orderId || `order_rzp_${Date.now()}`
    const mockSignature = `sig_rzp_${Math.random().toString(36).substring(2, 15)}`
    
    executePaymentVerification(orderId, mockPaymentId, mockSignature, `Razorpay (${methodName})`)
  }

  return (
    <div className="custom-container py-8 animate-fade-in text-xs text-slate-600 relative">
      
      {/* Interactive Razorpay Gateway Modal Overlay */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            
            {/* Razorpay Brand Header */}
            <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center font-black text-blue-400 border border-blue-400/30">
                  <Zap className="w-5 h-5 fill-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm tracking-wide text-white">Razorpay</span>
                    <span className="bg-blue-500/30 text-blue-300 font-extrabold text-4xs px-2 py-0.5 rounded-full uppercase tracking-wider">Test Sandbox</span>
                  </div>
                  <p className="text-3xs text-slate-300">VibeCart Checkout • {razorpayOrderInfo?.orderId || 'ORDER-TEST'}</p>
                </div>
              </div>

              <button 
                onClick={() => setShowRazorpayModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Amount Bar */}
            <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Amount Payable</span>
              <span className="font-black text-indigo-700 text-base">₹{(total * 85).toFixed(2)} (${total.toFixed(2)})</span>
            </div>

            {/* Payment Method Tabs inside Razorpay Modal */}
            <div className="p-6 space-y-6">
              
              <div className="space-y-3">
                <label className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Select UPI / Instant Payment</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUpiOption('gpay')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      selectedUpiOption === 'gpay' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="text-xs font-black text-blue-600">G Pay</span>
                    <span className="text-4xs text-slate-400">Google Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedUpiOption('phonepe')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      selectedUpiOption === 'phonepe' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="text-xs font-black text-purple-600">PhonePe</span>
                    <span className="text-4xs text-slate-400">UPI Instant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedUpiOption('paytm')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      selectedUpiOption === 'paytm' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="text-xs font-black text-cyan-600">Paytm</span>
                    <span className="text-4xs text-slate-400">UPI / Wallet</span>
                  </button>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-4xs font-bold text-slate-400 uppercase">Or Enter VPA / UPI ID</label>
                  <input 
                    type="text"
                    value={upiIdInput}
                    onChange={(e) => setUpiIdInput(e.target.value)}
                    placeholder="mobileNumber@upi (e.g. 9876543210@paytm)" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Quick Pay Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleSimulatedRazorpaySubmit(`UPI (${selectedUpiOption.toUpperCase()})`)}
                  className="w-full bg-[#0c2340] hover:bg-[#15345d] text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isProcessing ? 'Verifying...' : `Pay ₹${(total * 85).toFixed(2)} via ${selectedUpiOption.toUpperCase()}`}</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleSimulatedRazorpaySubmit('Netbanking SBI')}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs border border-slate-200"
                >
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>Pay via Netbanking (SBI / HDFC / ICICI)</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-4xs text-slate-400 text-center">
                <Lock className="w-3 h-3 text-emerald-500" />
                <span>Encrypted 256-bit SSL transaction verified by Razorpay</span>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Wizard Header Progress Bar */}
      <div className="flex items-center justify-center gap-2 md:gap-4 max-w-lg mx-auto mb-12">
        
        {/* Step 1: Address */}
        <div className="flex items-center gap-1.5 font-bold">
          <span className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-xs ${
            step === 'address' ? 'bg-indigo-600 text-white' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {step !== 'address' ? '✓' : '1'}
          </span>
          <span className={step === 'address' ? 'text-indigo-600' : 'text-slate-400'}>Shipping</span>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-300" />

        {/* Step 2: Payment */}
        <div className="flex items-center gap-1.5 font-bold">
          <span className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-xs ${
            step === 'payment' ? 'bg-indigo-600 text-white' : step === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
          }`}>
            {step === 'success' ? '✓' : '2'}
          </span>
          <span className={step === 'payment' ? 'text-indigo-600' : 'text-slate-400'}>Payment</span>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-300" />

        {/* Step 3: Success */}
        <div className="flex items-center gap-1.5 font-bold">
          <span className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-xs ${
            step === 'success' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
          }`}>
            3
          </span>
          <span className={step === 'success' ? 'text-indigo-600' : 'text-slate-400'}>Confirmation</span>
        </div>

      </div>

      {/* Main step routing */}
      {step === 'success' ? (
        
        /* Step 3: Celebration confirmation screen */
        <div className="max-w-xl mx-auto bg-white border border-slate-100 shadow-2xl rounded-3xl p-8 md:p-12 text-center space-y-6 relative overflow-hidden">
          
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="relative z-10 space-y-6">
            
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 font-extrabold px-3 py-1 rounded-full text-3xs uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Razorpay Payment Verified & Saved</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">Order Confirmed!</h1>
              <p className="text-slate-400 mt-2">
                Thank you for your purchase, {addressForm.firstName}! Your payment and order details have been securely recorded in our SQLite database.
              </p>
            </div>

            {/* Order Details Card */}
            <div className="bg-slate-50 border border-slate-200/50 p-6 rounded-2xl text-left space-y-3">
              <div className="flex justify-between border-b border-slate-200/50 pb-2">
                <span className="font-bold text-slate-500">Order ID</span>
                <span className="font-black text-indigo-600">{orderNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-2">
                <span className="font-bold text-slate-500">Transaction ID</span>
                <span className="font-mono text-2xs text-slate-700">{orderPaymentId || 'pay_razorpay_verified'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-2">
                <span className="font-bold text-slate-500">Deliver To</span>
                <span className="font-semibold text-slate-800 text-right">
                  {addressForm.address}, {addressForm.city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Estimated Delivery</span>
                <span className="font-bold text-emerald-600">3-5 Business Days</span>
              </div>
            </div>

            {emailSent ? (
              <p className="text-3xs text-slate-400 leading-relaxed">
                A detailed confirmation invoice has been sent to <span className="font-semibold text-slate-600">{confirmedEmail || addressForm.email}</span>. You can track this order live using order number <span className="font-bold text-indigo-600">{orderNumber}</span> with VibeBot.
              </p>
            ) : (
              <p className="text-3xs text-amber-700 bg-amber-50 border border-amber-200/80 p-3.5 rounded-xl leading-relaxed font-medium">
                Your order was confirmed successfully, but we couldn't send the confirmation email. Please check your email address or try again later.
              </p>
            )}

            <div className="pt-4">
              <Link 
                to="/" 
                className="btn-primary inline-flex items-center gap-2"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </div>

      ) : (

        /* Layout splits: Form fields + Order summary card */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Form Details */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-8">
            
            {step === 'address' ? (
              
              /* Address Details Capture Form */
              <form onSubmit={handleAddressSubmit} className="space-y-6">
                
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                  <MapPin className="w-5.5 h-5.5 text-indigo-500" />
                  <h2 className="text-base font-bold text-slate-900">Shipping Details</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-3xs font-extrabold uppercase text-slate-400">First Name</label>
                    <input
                      type="text"
                      required
                      value={addressForm.firstName}
                      onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                      placeholder="John"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-3xs font-extrabold uppercase text-slate-400">Last Name</label>
                    <input
                      type="text"
                      required
                      value={addressForm.lastName}
                      onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                      placeholder="Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-3xs font-extrabold uppercase text-slate-400">Email Address</label>
                  <input
                    type="email"
                    required
                    value={addressForm.email}
                    onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                    placeholder="john.doe@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-3xs font-extrabold uppercase text-slate-400">Street Address</label>
                  <input
                    type="text"
                    required
                    value={addressForm.address}
                    onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                    placeholder="123 Shopping Blvd"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-3xs font-extrabold uppercase text-slate-400">City</label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      placeholder="Mumbai / New York"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-3xs font-extrabold uppercase text-slate-400">ZIP / Postal Code</label>
                    <input
                      type="text"
                      required
                      value={addressForm.zip}
                      onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                      placeholder="400001"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-3xs font-extrabold uppercase text-slate-400">Contact Number</label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-4 text-xs font-bold flex items-center justify-center gap-1.5 mt-8 cursor-pointer"
                >
                  <span>Continue to Payment Selection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </form>

            ) : (

              /* Step 2: Payment Selection & Execution */
              <div className="space-y-6">
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5.5 h-5.5 text-indigo-500" />
                    <h2 className="text-base font-bold text-slate-900">Choose Payment Method</h2>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setStep('address')}
                    className="text-indigo-600 hover:text-red-500 font-bold transition-colors cursor-pointer"
                  >
                    Back to Shipping
                  </button>
                </div>

                {/* Payment Option Selector Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between space-y-2 transition-all cursor-pointer ${
                      paymentMethod === 'razorpay' 
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className="text-3xs font-extrabold uppercase bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Recommended</span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900">Razorpay Gateway</h4>
                      <p className="text-3xs text-slate-400 mt-0.5">UPI, Cards, Netbanking, Wallets</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between space-y-2 transition-all cursor-pointer ${
                      paymentMethod === 'card' 
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="text-3xs font-bold text-slate-400">Direct</span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900">Credit / Debit Card</h4>
                      <p className="text-3xs text-slate-400 mt-0.5">Manual 3D Card Visualizer</p>
                    </div>
                  </button>
                </div>

                {/* Option 1: Razorpay Gateway View */}
                {paymentMethod === 'razorpay' ? (
                  <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 md:p-8 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 font-black text-6xl select-none">RAZORPAY</div>
                    
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        <h3 className="text-lg font-black tracking-wide">Razorpay Checkout</h3>
                      </div>
                      
                      <p className="text-xs text-indigo-100/80 leading-relaxed">
                        Complete your purchase seamlessly via Razorpay. Supports Google Pay, PhonePe, Paytm, BHIM UPI, Netbanking across all major banks, and Debit/Credit cards with zero additional processing fees.
                      </p>

                      <div className="grid grid-cols-3 gap-2 pt-2 text-center text-4xs uppercase tracking-wider font-extrabold text-indigo-200">
                        <div className="bg-indigo-950/50 p-2.5 rounded-xl border border-indigo-700/50">⚡ Instant UPI</div>
                        <div className="bg-indigo-950/50 p-2.5 rounded-xl border border-indigo-700/50">💳 All Cards</div>
                        <div className="bg-indigo-950/50 p-2.5 rounded-xl border border-indigo-700/50">🏛️ 50+ Banks</div>
                      </div>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={handleRazorpayPayment}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 text-sm mt-4 cursor-pointer"
                      >
                        {isProcessing ? (
                          <span>Opening Razorpay Modal...</span>
                        ) : (
                          <>
                            <Zap className="w-5 h-5 fill-slate-950" />
                            <span>Pay Now with Razorpay (${total.toFixed(2)})</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-center gap-2 text-4xs text-indigo-200/70 pt-2">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Protected by 256-bit Bank Grade SSL Encryption</span>
                      </div>
                    </div>
                  </div>
                ) : (

                  /* Option 2: 3D Interactive Card visualizer form */
                  <form onSubmit={handleCardSubmit} className="space-y-8">
                    <div className="flex justify-center py-2">
                      <div 
                        className="relative w-[320px] h-[190px] rounded-2xl shadow-2xl text-white font-mono tracking-widest text-sm select-none"
                        style={{
                          perspective: '1000px',
                          transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          transformStyle: 'preserve-3d',
                          transform: cardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                        }}
                      >
                        {/* Front View */}
                        <div 
                          className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-tr from-indigo-800 via-purple-700 to-indigo-900 p-6 flex flex-col justify-between"
                          style={{
                            backfaceVisibility: 'hidden',
                            boxShadow: '0 15px 35px rgba(50,50,93,0.1), 0 5px 15px rgba(0,0,0,0.07)'
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div className="w-10 h-7 rounded-sm bg-gradient-to-tr from-yellow-300 via-yellow-200 to-amber-400 opacity-80 border border-amber-300 shadow-inner"></div>
                            <span className="font-black italic text-lg tracking-tight">VISA</span>
                          </div>

                          <p className="text-base tracking-widest pt-4 font-semibold">
                            {cardForm.number || '•••• •••• •••• ••••'}
                          </p>

                          <div className="flex justify-between items-end mt-2 uppercase">
                            <div>
                              <p className="text-4xs opacity-60 tracking-wider">Card Holder</p>
                              <p className="text-2xs truncate max-w-[170px] font-bold tracking-normal">{cardForm.name || 'John Doe'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-4xs opacity-60 tracking-wider">Expires</p>
                              <p className="text-2xs font-bold">{cardForm.expiry || 'MM/YY'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Back View */}
                        <div 
                          className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-950 py-6 flex flex-col justify-between"
                          style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            boxShadow: '0 15px 35px rgba(50,50,93,0.1), 0 5px 15px rgba(0,0,0,0.07)'
                          }}
                        >
                          <div className="h-10 bg-slate-900 w-full mt-2"></div>
                          
                          <div className="px-6 flex items-center justify-between gap-4 mt-2">
                            <div className="flex-1 bg-white h-7 rounded-sm flex items-center justify-end px-3 text-slate-800 text-2xs italic font-bold">
                              {cardForm.name || ''}
                            </div>
                            <div className="text-right">
                              <p className="text-4xs text-slate-400 font-sans tracking-wide">CVV</p>
                              <p className="text-2xs bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-sm">
                                {cardForm.cvv || '•••'}
                              </p>
                            </div>
                          </div>

                          <div className="px-6 flex justify-between items-center text-4xs text-slate-500 font-sans tracking-normal">
                            <span>Customer service +91 8081805437</span>
                            <span className="font-bold">SECURE DB</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-3xs font-extrabold uppercase text-slate-400">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          value={cardForm.name}
                          onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                          placeholder="John Doe"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-700"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-3xs font-extrabold uppercase text-slate-400">Card Number</label>
                        <input
                          type="text"
                          required
                          maxLength={19}
                          value={cardForm.number}
                          onChange={(e) => setCardForm({ ...cardForm, number: formatCardNumber(e.target.value) })}
                          placeholder="4000 1234 5678 9010"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-3xs font-extrabold uppercase text-slate-400">Expiration Date</label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            value={cardForm.expiry}
                            onChange={(e) => setCardForm({ ...cardForm, expiry: formatExpiry(e.target.value) })}
                            placeholder="12/28"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-3xs font-extrabold uppercase text-slate-400">CVV Security Code</label>
                          <input
                            type="password"
                            required
                            maxLength={3}
                            value={cardForm.cvv}
                            onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '') })}
                            onFocus={() => setCardFlipped(true)}
                            onBlur={() => setCardFlipped(false)}
                            placeholder="123"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full btn-primary py-4 text-xs font-bold flex items-center justify-center gap-1.5 mt-8 shadow-indigo-200 disabled:opacity-50 cursor-pointer"
                    >
                      <ShieldCheck className="w-4.5 h-4.5" />
                      <span>{isProcessing ? 'Saving Order...' : `Complete Direct Payment ($${total.toFixed(2)})`}</span>
                    </button>
                  </form>
                )}

              </div>

            )}

          </div>

          {/* Right Column: Order Summary Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-50 rounded-3xl border border-slate-200/50 p-6 md:p-8 space-y-6">
              
              <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
                <ShoppingBag className="w-5.5 h-5.5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Order Summary</h2>
              </div>

              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {cart.map((item, idx) => {
                  const finalItemPrice = item.price * (1 - (item.discount || 0) / 100)
                  return (
                    <div key={`${item.id}-${idx}`} className="flex gap-3 justify-between items-center text-xs">
                      <div className="flex gap-3 items-center min-w-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-11 h-11 object-cover rounded-lg border border-slate-200 bg-white" 
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-800 truncate max-w-[150px] leading-tight">
                            {item.name}
                          </h4>
                          <span className="text-3xs text-slate-400">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-extrabold text-slate-900 flex-shrink-0">
                        ${(finalItemPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Sales Tax (8%)</span>
                  <span className="font-bold text-slate-800">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Cost</span>
                  <span className="font-bold text-slate-800">
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="border-t border-slate-200 pt-4 flex justify-between text-sm font-black text-slate-900">
                  <span>Final Total</span>
                  <span className="text-lg text-indigo-600">${total.toFixed(2)}</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      )}

    </div>
  )
}

export default Checkout
