import { Navigate, Route, Routes } from 'react-router-dom'
import ShellLayout from '../layouts/ShellLayout'
import CameraDetailRoute from '../routes/CameraDetailRoute'
import CamerasRoute from '../routes/CamerasRoute'
import ActivityRoute from '../routes/ActivityRoute'
import AlertsRoute from '../routes/AlertsRoute'
import IncidentsRoute from '../routes/IncidentsRoute'
import TrafficRoute from '../routes/TrafficRoute'
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
            <Route path="/cameras" element={<CamerasRoute />} />
            <Route path="/cameras/:cameraId" element={<CameraDetailRoute />} />
            <Route path="/activity" element={<ActivityRoute />} />
            <Route path="/alerts" element={<AlertsRoute />} />
            <Route path="/incidents" element={<IncidentsRoute />} />
            <Route path="/traffic" element={<TrafficRoute />} />
            <Route path="/settings" element={<SettingsRoute />} />
          </Route>
        </Routes>
      </EventEngineProvider>
    </ThemeProvider>
  )
}

