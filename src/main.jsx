import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', padding: 24, textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, marginBottom: 12, color: '#1a1a1a' }}>Something went wrong</h2>
          <p style={{ color: '#757575', marginBottom: 24 }}>Please refresh the page or try again.</p>
          <button onClick={() => window.location.reload()} style={{ background: '#00897b', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 12, fontSize: 15, cursor: 'pointer' }}>
            Refresh
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
