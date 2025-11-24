import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Playground from "@/pages/Playground"
import Lab from "@/pages/Lab"
import Settings from "@/pages/Settings"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/playground" replace />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/evals" element={<Lab />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  )
}

export default App
