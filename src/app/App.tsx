import { Navigate, Route, Routes } from 'react-router-dom'
import ShellLayout from '../layouts/ShellLayout'
import DashboardRoute from '../routes/DashboardRoute'
import SettingsRoute from '../routes/SettingsRoute'
import { ThemeProvider } from './providers/ThemeProvider'
import { EventEngineProvider } from './providers/EventEngineProvider'

export default function App() {
  return (
    <ThemeProvider>
      <EventEngineProvider>
      <Routes>
        <Route element={<ShellLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardRoute />} />
          <Route path="/settings" element={<SettingsRoute />} />
        </Route>
      </Routes>
      </EventEngineProvider>
    </ThemeProvider>
  )
}

