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
import { CraftLabSuccess } from './pages/craftlab/CraftLabSuccess';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/craftlab/onboarding" element={<CraftLabOnboarding />} />
        <Route path="/craftlab/education/basic" element={<CraftLabBasicEducation />} />
        <Route path="/craftlab/education/advanced" element={<CraftLabTechEducation />} />
        <Route path="/craftlab/education/quiz" element={<CraftLabQuiz />} />
        <Route path="/craftlab/welcome" element={<CraftLabWelcome />} />
        <Route path="/craftlab/configurator" element={<CraftLabConfigurator />} />
        <Route path="/craftlab/success" element={<CraftLabSuccess />} />
        <Route path="/forward-booking/route" element={<ForwardBookingRoute />} />
        <Route path="/forward-booking/date" element={<DateSelector />} />
        <Route path="/forward-booking/variety" element={<VarietySelector />} />
        <Route path="/forward-booking/flavor" element={<FlavorSelector />} />
        <Route path="/forward-booking/process" element={<ProcessSelector />} />
        <Route path="/forward-booking/quantity" element={<QuantitySelector />} />
        <Route path="/forward-booking/review" element={<ReviewConfirm />} />
        <Route path="/forward-booking/success" element={<Success />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
