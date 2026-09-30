import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CalendarPage } from './components/CalendarPage'
import { IntegratingPage } from './components/IntegratingPage'
import { LandingPage } from './components/LandingPage'
import { LoginPage } from './components/LoginPage'
import { SetupPage } from './components/SetupPage'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/connect" element={<IntegratingPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
