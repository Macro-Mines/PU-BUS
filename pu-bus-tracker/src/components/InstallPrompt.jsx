import { useState, useEffect } from 'react'
import { X, Download, Share } from 'lucide-react'

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if it's iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(ios)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
      // Update UI notify the user they can install the PWA
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS, show the prompt if not in standalone mode
    if (ios && !window.navigator.standalone) {
      // Show after a short delay
      const timer = setTimeout(() => setShowPrompt(true), 5000)
      return () => clearTimeout(timer)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="install-prompt-overlay">
      <div className="install-prompt-card shadow-xl animate-slide-up">
        <button className="install-close" onClick={() => setShowPrompt(false)}>
          <X size={18} />
        </button>

        <div className="install-header">
          <div className="install-icon">🚌</div>
          <div className="install-title-group">
            <h3>Install PU BUS</h3>
            <p>Add to home screen for quick access</p>
          </div>
        </div>

        {isIOS ? (
          <div className="ios-instructions">
            <div className="ios-step">
              <span className="step-icon"><Share size={16} /></span>
              <span>Tap the <strong>Share</strong> button below</span>
            </div>
            <div className="ios-step">
              <span className="step-icon">➕</span>
              <span>Select <strong>'Add to Home Screen'</strong></span>
            </div>
          </div>
        ) : (
          <button className="install-btn" onClick={handleInstallClick}>
            <Download size={18} />
            Install App
          </button>
        )}
      </div>
    </div>
  )
}
