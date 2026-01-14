import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import HomePage from './pages/HomePage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';

function AppContent() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isPaymentPage = location.pathname === '/plata' || location.pathname === '/plata/success';

  const scrollToSection = (sectionId: string) => {
    // Dacă nu suntem pe pagina principală, navigăm acolo mai întâi
    if (location.pathname !== '/') {
      navigate('/');
      // Așteptăm puțin pentru ca pagina să se încarce, apoi facem scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // Dacă suntem deja pe pagina principală, facem scroll direct
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  useEffect(() => {
    const handleOpenContactModal = () => {
      setIsContactModalOpen(true);
    };

    window.addEventListener('openContactModal', handleOpenContactModal);
    return () => {
      window.removeEventListener('openContactModal', handleOpenContactModal);
    };
  }, []);

  // Redirect to home if on invalid route (except /plata and /plata/success)
  useEffect(() => {
    if (location.pathname !== '/' && location.pathname !== '/plata' && location.pathname !== '/plata/success') {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!isPaymentPage && (
        <Header 
          onNavigate={scrollToSection}
          onContactClick={() => setIsContactModalOpen(true)}
        />
      )}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/plata" element={<PaymentPage />} />
          <Route path="/plata/success" element={<PaymentSuccessPage />} />
          {/* Redirect to home for any other routes */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      {!isPaymentPage && <Footer />}
      <ContactModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
