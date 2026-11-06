import React, { useState, useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Phone, 
  Clock,
  Send,
  MessageSquare
} from 'lucide-react'

const FAQ_ITEMS = [
  {
    id: 1,
    question: "How long does shipping take?",
    answer: "Standard delivery takes between 3 to 5 business days. Express shipping options take 1 to 2 business days. Free shipping is automatically applied to all domestic orders over $150.",
    category: "Shipping"
  },
  {
    id: 2,
    question: "What is your return policy?",
    answer: "We offer a 30-day easy return guarantee. If you are not completely satisfied with your purchase, you may return the item in its original retail packaging for a full refund or exchange.",
    category: "Returns"
  },
  {
    id: 3,
    question: "How do I apply a discount coupon code?",
    answer: "You can apply coupon codes inside the sliding cart drawer or directly on the checkout summary screen. Enter active codes like 'SAVE20' in the discount inputs and click 'Apply' to see pricing update instantly.",
    category: "Billing"
  },
  {
    id: 4,
    question: "Is my payment information secure?",
    answer: "Absolutely. All transactions are processed under AES-256 secure encrypted socket layers (SSL). We do not store or transit sensitive raw credit card numbers on our servers.",
    category: "Safety"
  },
  {
    id: 5,
    question: "Do you ship internationally?",
    answer: "Currently, VibeCart ships to the continental United States, Canada, and parts of Europe. International shipping times range from 7 to 14 business days, and customs charges may apply depending on your location.",
    category: "Shipping"
  }
]

const HelpCenter = () => {
  const { showNotification } = useContext(ShopContext)
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaqId, setOpenFaqId] = useState(1) // Default first item open

  // Support Form State
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    subject: 'order-inquiry',
    message: ''
  })

  const handleSupportSubmit = (e) => {
    e.preventDefault()
    if (supportForm.name.trim() === '' || supportForm.message.trim() === '') return
    
    showNotification(`Support ticket sent! We will contact you soon.`, 'success')
    setSupportForm({
      name: '',
      email: '',
      subject: 'order-inquiry',
      message: ''
    })
  }

  // Filter FAQs by search query
  const filteredFaqs = FAQ_ITEMS.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id)
  }

  return (
    <div className="custom-container py-8 animate-fade-in text-xs text-slate-600 space-y-16">
      
      {/* Page Title & Search Header */}
      <section className="text-center max-w-xl mx-auto space-y-4 py-8">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
          <HelpCircle className="w-6.5 h-6.5" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">Help Center & FAQ</h1>
        <p className="text-slate-400 mt-2 text-xs">
          Have questions? Find answers instantly in our customer documentation or create a direct support ticket.
        </p>

        {/* Live FAQ search bar */}
        <div className="relative max-w-md mx-auto pt-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs (e.g. shipping, returns)..."
            className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2.5 shadow-sm text-slate-800"
          />
          <Search className="absolute left-3.5 top-5 w-4 h-4 text-slate-400" />
        </div>
      </section>

      {/* Grid: FAQs + Ticket Form */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Searchable FAQ Accordion */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5 pb-3 border-b border-slate-100">
            <MessageSquare className="w-4.5 h-4.5 text-indigo-500" />
            <span>Frequently Asked Questions</span>
          </h2>

          {filteredFaqs.length === 0 ? (
            <div className="bg-slate-50 p-8 rounded-2xl text-center text-slate-400">
              No matching FAQs found. Please check spelling or contact support!
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id
                return (
                  <div 
                    key={faq.id} 
                    className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-shadow duration-250"
                  >
                    {/* Header bar clicker */}
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full px-5 py-4 text-left font-bold text-slate-800 flex justify-between items-center hover:bg-slate-50 transition-colors gap-3"
                    >
                      <span className="text-xs">{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                    </button>

                    {/* Answer panel (with custom height transitions) */}
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-slate-500 leading-relaxed border-t border-slate-50 animate-fade-in">
                        <p>{faq.answer}</p>
                        <div className="mt-3">
                          <span className="text-4xs font-bold uppercase tracking-wider bg-slate-100 text-slate-400 px-2 py-0.5 rounded-md">
                            Topic: {faq.category}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Support form + Contact details panel */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Support Ticket form */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200/50 p-6 md:p-8">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-4">
              <Send className="w-4 h-4 text-indigo-500" />
              <span>Contact Customer Care</span>
            </h3>
            <form onSubmit={handleSupportSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-3xs font-extrabold uppercase text-slate-500">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={supportForm.name}
                  onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                  placeholder=""
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-3xs font-extrabold uppercase text-slate-500">Email Address</label>
                <input
                  type="email"
                  required
                  value={supportForm.email}
                  onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                  placeholder="abc@gmai.com.com"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-3xs font-extrabold uppercase text-slate-500">Reason for Inquiry</label>
                <select
                  value={supportForm.subject}
                  onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 font-semibold"
                >
                  <option value="order-inquiry">Order Status / Tracking</option>
                  <option value="refund-request">Refund / Exchange Request</option>
                  <option value="billing-issue">Payment & Billing Issue</option>
                  <option value="general-feedback">General Store Feedback</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-3xs font-extrabold uppercase text-slate-500">Describe Your Issue</label>
                <textarea
                  required
                  rows={4}
                  value={supportForm.message}
                  onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                  placeholder="Provide order numbers or key details to help us assist you faster..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Send Support Ticket
              </button>

            </form>
          </div>

          {/* Quick Contact Panel */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4">
            <h4 className="text-slate-800 font-bold text-xs uppercase tracking-wider">Direct Hotline</h4>
            <div className="space-y-3.5 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-3">
                <Phone className="w-4.5 h-4.5 text-indigo-500" />
                <div>
                  <p className="text-slate-800 font-bold">+91 8081805437</p>
                  <p className="text-3xs text-slate-400">Toll Free 24/7 Hotline</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4.5 h-4.5 text-indigo-500" />
                <div>
                  <p className="text-slate-800 font-bold">support@vibecart.com</p>
                  <p className="text-3xs text-slate-400">Average response under 2 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4.5 h-4.5 text-indigo-500" />
                <div>
                  <p className="text-slate-800 font-bold">Mon - Fri, 9AM - 6PM EST</p>
                  <p className="text-3xs text-slate-400">Warehouse Fulfillment Operations</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </section>

    </div>
  )
}

export default HelpCenter
