import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

const NotificationToast = () => {
  const { notifications } = useContext(ShopContext)

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map((toast) => {
        
        // Define styles and icons based on notification type
        let bgStyle = 'bg-white'
        let borderStyle = 'border-slate-100'
        let icon = <Info className="w-5 h-5 text-indigo-500" />
        
        switch (toast.type) {
          case 'success':
            bgStyle = 'bg-emerald-50'
            borderStyle = 'border-emerald-100'
            icon = <CheckCircle className="w-5 h-5 text-emerald-600" />
            break
          case 'error':
            bgStyle = 'bg-rose-50'
            borderStyle = 'border-rose-100'
            icon = <AlertCircle className="w-5 h-5 text-rose-600" />
            break
          case 'warning':
            bgStyle = 'bg-amber-50'
            borderStyle = 'border-amber-100'
            icon = <AlertTriangle className="w-5 h-5 text-amber-600" />
            break
          case 'info':
            bgStyle = 'bg-indigo-50'
            borderStyle = 'border-indigo-100'
            icon = <Info className="w-5 h-5 text-indigo-600" />
            break
          default:
            break
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl ${bgStyle} ${borderStyle} animate-slide-in-right transition-all duration-300`}
            style={{
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)'
            }}
          >
            {/* Status Icon */}
            <div className="flex-shrink-0 pt-0.5">{icon}</div>

            {/* Notification message */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 leading-normal">
                {toast.message}
              </p>
            </div>

            {/* Manual Dismiss */}
            <div className="flex-shrink-0 self-start">
              <span className="sr-only">Close</span>
              {/* Note: Autohide removes it in context after 4s, no strictly needed custom close, but nice */}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default NotificationToast
