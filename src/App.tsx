import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { ForwardBookingRoute } from './pages/ForwardBookingRoute';
import { DateSelector } from './pages/DateSelector';
import { VarietySelector } from './pages/VarietySelector';
import { FlavorSelector } from './pages/FlavorSelector';
import { ProcessSelector } from './pages/ProcessSelector';
import { QuantitySelector } from './pages/QuantitySelector';
import { ReviewConfirm } from './pages/ReviewConfirm';
import { Success } from './pages/Success';
import { Orders } from './pages/Orders';
import { CraftLabOnboarding } from './pages/craftlab/CraftLabOnboarding';
import { CraftLabBasicEducation } from './pages/craftlab/CraftLabBasicEducation';
import { CraftLabTechEducation } from './pages/craftlab/CraftLabTechEducation';
import { CraftLabQuiz } from './pages/craftlab/CraftLabQuiz';
import { CraftLabWelcome } from './pages/craftlab/CraftLabWelcome';
import { CraftLabConfigurator } from './pages/craftlab/CraftLabConfigurator';
import { About } from './pages/About';
import { Profile } from './pages/Profile';
import { Notifications } from './pages/Notifications';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppShell } from './components/AppShell';

/**
 * shell() — rutas con sidebar desktop + bottom-nav mobile.
 * AppShell internamente maneja ProtectedRoute.
 */
const shell = (el: React.ReactElement) => <AppShell>{el}</AppShell>;

/**
 * protect() — rutas fullscreen sin sidebar (wizards).
 * AppShell detecta los paths de wizards y devuelve solo ProtectedRoute,
 * pero usamos protect() directo aquí para mayor claridad.
 */
const protect = (el: React.ReactElement) => <ProtectedRoute>{el}</ProtectedRoute>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pública */}
        <Route path="/login" element={<Login />} />

        {/* Rutas con AppShell (sidebar desktop + bottom-nav mobile) */}
        <Route path="/home"          element={shell(<Home />)} />
        <Route path="/orders"        element={shell(<Orders />)} />
        <Route path="/about"         element={shell(<About />)} />
        <Route path="/profile"       element={shell(<Profile />)} />
        <Route path="/notifications" element={shell(<Notifications />)} />

        {/* Wizards fullscreen — sin sidebar, sin shell */}
        <Route path="/craftlab/onboarding"         element={protect(<CraftLabOnboarding />)} />
        <Route path="/craftlab/education/basic"    element={protect(<CraftLabBasicEducation />)} />
        <Route path="/craftlab/education/advanced" element={protect(<CraftLabTechEducation />)} />
        <Route path="/craftlab/education/quiz"     element={protect(<CraftLabQuiz />)} />
        <Route path="/craftlab/welcome"            element={protect(<CraftLabWelcome />)} />
        <Route path="/craftlab/configurator"       element={protect(<CraftLabConfigurator />)} />

        <Route path="/forward-booking/route"    element={protect(<ForwardBookingRoute />)} />
        <Route path="/forward-booking/date"     element={protect(<DateSelector />)} />
        <Route path="/forward-booking/variety"  element={protect(<VarietySelector />)} />
        <Route path="/forward-booking/flavor"   element={protect(<FlavorSelector />)} />
        <Route path="/forward-booking/process"  element={protect(<ProcessSelector />)} />
        <Route path="/forward-booking/quantity" element={protect(<QuantitySelector />)} />
        <Route path="/forward-booking/review"   element={protect(<ReviewConfirm />)} />
        <Route path="/forward-booking/success"  element={protect(<Success />)} />

        {/* Raíz → login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
