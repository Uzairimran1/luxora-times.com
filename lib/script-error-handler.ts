// Global script error handler for TradingView widgets
export function initializeScriptErrorHandler() {
  // Handle uncaught script errors
  window.addEventListener("error", (event) => {
    if (event.filename && event.filename.includes("tradingview.com")) {
      console.warn("TradingView script error handled:", event.message)
      event.preventDefault()
      return false
    }
  })

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    if (event.reason && typeof event.reason === "string" && event.reason.includes("TradingView")) {
      console.warn("TradingView promise rejection handled:", event.reason)
      event.preventDefault()
    }
  })

  // Handle script loading errors
  document.addEventListener(
    "error",
    (event) => {
      const target = event.target as HTMLElement
      if (target && target.tagName === "SCRIPT" && target.getAttribute("src")?.includes("tradingview.com")) {
        console.warn("TradingView script loading error handled")
        event.preventDefault()
      }
    },
    true,
  )
}

// CSP helper for TradingView
export function addTradingViewCSP() {
  const meta = document.createElement("meta")
  meta.httpEquiv = "Content-Security-Policy"
  meta.content = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' *.tradingview.com *.tradingview-widget.com s3.tradingview.com;
    style-src 'self' 'unsafe-inline' *.tradingview.com;
    img-src 'self' data: blob: *.tradingview.com *.tradingview-widget.com;
    connect-src 'self' *.tradingview.com *.tradingview-widget.com wss://*.tradingview.com;
    frame-src 'self' *.tradingview.com *.tradingview-widget.com;
    worker-src 'self' blob:;
  `
    .replace(/\s+/g, " ")
    .trim()

  document.head.appendChild(meta)
}
