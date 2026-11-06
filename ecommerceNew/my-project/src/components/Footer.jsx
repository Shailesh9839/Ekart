import React, { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { 
  Mail, 
  MapPin, 
  Phone, 
  Send 
} from 'lucide-react'

const Footer = () => {
  const { showNotification } = useContext(ShopContext)
  const [email, setEmail] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email.trim() !== '') {
      showNotification(`Thank you! ${email} has been subscribed to our newsletter.`, 'success')
      setEmail('')
    }
  }

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 mt-20 border-t border-slate-800">
      <div className="custom-container">
        
        {/* Top Section: Brand + Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 select-none group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-md">
                V
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                VibeCart
              </span>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Elevating your lifestyle with curated modern products. Shop premium electronics, clothing, and interior design items with ease and confidence.
            </p>
          </div>

          {/* Interactive Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-white tracking-wider uppercase">
              Subscribe to our newsletter
            </h3>
            <p className="text-xs text-slate-400">
              Get 10% off your next purchase and stay updated with new collections and special promotions.
            </p>
            <form onSubmit={handleSubscribe} className="flex max-w-md gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 pl-10 pr-3 py-2.5 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 transition-colors"
                />
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>Subscribe</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* Middle Section: Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 text-xs">
          
          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-white font-bold tracking-wider uppercase">Shop Categories</h4>
            <ul className="space-y-2.5 text-slate-400 font-medium">
              <li>
                <Link to="/?category=Electronics" className="hover:text-indigo-400 transition-colors">
                  Premium Electronics
                </Link>
              </li>
              <li>
                <Link to="/?category=Fashion" className="hover:text-indigo-400 transition-colors">
                  Modern Fashion
                </Link>
              </li>
              <li>
                <Link to="/?category=Home Decor" className="hover:text-indigo-400 transition-colors">
                  Elegant Home Decor
                </Link>
              </li>
              <li>
                <Link to="/?category=Outdoor" className="hover:text-indigo-400 transition-colors">
                  Rugged Outdoor Gear
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-bold tracking-wider uppercase">Quick Links</h4>
            <ul className="space-y-2.5 text-slate-400 font-medium">
              <li>
                <Link to="/" className="hover:text-indigo-400 transition-colors">Shop Home</Link>
              </li>
              <li>
                <Link to="/?filter=wishlist" className="hover:text-indigo-400 transition-colors">My Wishlist</Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-indigo-400 transition-colors">Checkout</Link>
              </li>
              <li>
                <Link to="/help-center" className="hover:text-indigo-400 transition-colors">Help Center & FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-white font-bold tracking-wider uppercase">Customer Policy</h4>
            <ul className="space-y-2.5 text-slate-400 font-medium">
              <li>
                <Link to="/help-center" className="hover:text-indigo-400 transition-colors">Free Shipping Over $150</Link>
              </li>
              <li>
                <Link to="/help-center" className="hover:text-indigo-400 transition-colors">30-Day Money Back Guarantee</Link>
              </li>
              <li>
                <Link to="/help-center" className="hover:text-indigo-400 transition-colors">Secure Checkout Protection</Link>
              </li>
              <li>
                <Link to="/help-center" className="hover:text-indigo-400 transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="space-y-4">
            <h4 className="text-white font-bold tracking-wider uppercase">Get In Touch</h4>
            <ul className="space-y-3 text-slate-400 font-medium">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>Knowledge Park-2, New-Delhi</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-indigo-400" />
                <span>+91 8081805437</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>support@vibecart.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section: Socials + Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-800 gap-4">
          
          {/* Copyright */}
          <p className="text-2xs text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} VibeCart Inc. Designed for premium coding benchmark. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a href="#" className="p-2 bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-lg transition-all" title="Facebook">
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
            </a>
            <a href="#" className="p-2 bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-lg transition-all" title="Twitter">
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" className="p-2 bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-lg transition-all" title="Instagram">
              <svg className="w-4.5 h-4.5 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="#" className="p-2 bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-lg transition-all" title="Youtube">
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>

        </div>

      </div>
    </footer>
  )
}

export default Footer
