import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './components/Toast'
import { isConfigured } from './lib/supabase'
import './index.css'

function SetupNotice() {
  return (
    <main className="grid min-h-[100dvh] place-items-center p-6">
      <div className="max-w-md rounded-3xl border border-line bg-panel p-7">
        <h1 className="font-display text-xl font-semibold">Falta conectar Supabase</h1>
        <p className="mt-3 text-sm text-mute">Crea el archivo <code>.env.local</code> a partir de <code>.env.example</code> con la URL y la clave publishable de tu proyecto, y reinicia el servidor. En Vercel, añade las mismas variables en Settings → Environment Variables y vuelve a desplegar.</p>
      </div>
    </main>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      {isConfigured ? (
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      ) : (
        <SetupNotice />
      )}
    </ThemeProvider>
  </React.StrictMode>,
)
