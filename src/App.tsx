import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
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
        <Route path="/orders" element={<Orders />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
