import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircleIcon, ClockIcon, DocumentIcon, EnvelopeIcon, EyeIcon, MapPinIcon, SignalIcon, ArrowPathIcon, ShieldCheckIcon, ArrowDownTrayIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import PaymentForm from '../components/PaymentForm';
import PaymentLogos from '../components/PaymentLogos';

interface CompanyData {
  cui: string;
  name: string;
  address: string;
  registrationNumber: string;
  phone: string;
  postalCode: string;
  status: string;
}

// Opțiuni pentru scop document
const documentPurposeOptions = [
  { value: '', label: 'Scop document' },
  { value: 'informare', label: 'Informare' },
  { value: 'fonduri_imm', label: 'Fonduri IMM' },
  { value: 'insolventa', label: 'Insolvență' },
  { value: 'inspectoratul_general_pentru_imigrari', label: 'Inspectoratul General pentru Imigrări' },
  { value: 'casa_nationala_de_asigurari_de_sanatate', label: 'Casa Națională de Asigurări de Sănătate' },
  { value: 'licitatie', label: 'Licitatie' },
  { value: 'notar', label: 'Notar' },
  { value: 'banca', label: 'Bancă' },
  { value: 'autorizare', label: 'Autorizare' },
  { value: 'instanta', label: 'Instanță' },
  { value: 'clasificare_turism', label: 'Clasificare Turism' },
  { value: 'inmatriculare_auto', label: 'Înmatriculare Auto' },
  { value: 'autoritate_publica', label: 'Autoritate Publică' },
  { value: 'anaf', label: 'ANAF' },
  { value: 'apia', label: 'APIA' },
  { value: 'altele', label: 'Altele (completare manuală)' },
];

// Opțiuni pentru tip extras
const extractTypeOptions = [
  { value: '', label: 'Tip document' },
  { value: 'situatie_la_zi', label: 'Situatie la zi - 165 lei' },
  { value: 'raport_istoric', label: 'Raport istoric - 247 lei' },
];

// Opțiuni pentru prefixe de țară
const countryCodes = [
  { code: '+40', country: 'RO', label: 'România (+40)' },
  { code: '+1', country: 'US', label: 'SUA/Canada (+1)' },
  { code: '+44', country: 'GB', label: 'Regatul Unit (+44)' },
  { code: '+49', country: 'DE', label: 'Germania (+49)' },
  { code: '+33', country: 'FR', label: 'Franța (+33)' },
  { code: '+39', country: 'IT', label: 'Italia (+39)' },
  { code: '+34', country: 'ES', label: 'Spania (+34)' },
  { code: '+32', country: 'BE', label: 'Belgia (+32)' },
  { code: '+31', country: 'NL', label: 'Olanda (+31)' },
  { code: '+41', country: 'CH', label: 'Elveția (+41)' },
  { code: '+43', country: 'AT', label: 'Austria (+43)' },
  { code: '+36', country: 'HU', label: 'Ungaria (+36)' },
  { code: '+359', country: 'BG', label: 'Bulgaria (+359)' },
  { code: '+381', country: 'RS', label: 'Serbia (+381)' },
  { code: '+385', country: 'HR', label: 'Croația (+385)' },
  { code: '+386', country: 'SI', label: 'Slovenia (+386)' },
  { code: '+420', country: 'CZ', label: 'Cehia (+420)' },
  { code: '+421', country: 'SK', label: 'Slovacia (+421)' },
  { code: '+48', country: 'PL', label: 'Polonia (+48)' },
  { code: '+7', country: 'RU', label: 'Rusia (+7)' },
];

const HomePage = () => {
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Verificăm dacă venim de la PaymentPage și restauram datele
  useEffect(() => {
    const locationState = location.state as any;
    if (locationState?.returnFromPayment) {
      // Restauram toate datele din sessionStorage
      const savedFormData = sessionStorage.getItem('homePageFormData');
      if (savedFormData) {
        try {
          const formData = JSON.parse(savedFormData);
          console.log('Restoring form data from sessionStorage:', formData);
          
          // Restauram toate datele formularului
          if (formData.companyData) setCompanyData(formData.companyData);
          if (formData.cui) setCui(formData.cui || formData.companyData?.cui || '');
          if (formData.requestType) setRequestType(formData.requestType);
          if (formData.applicantType) setApplicantType(formData.applicantType);
          if (formData.billingType) setBillingType(formData.billingType);
          if (formData.billingCui) setBillingCui(formData.billingCui);
          if (formData.billingCompanyData) setBillingCompanyData(formData.billingCompanyData);
          if (formData.billingFormData) _setBillingFormData(formData.billingFormData);
          if (formData.contactData) setContactData(formData.contactData);
          if (formData.phoneCountryCode) setPhoneCountryCode(formData.phoneCountryCode);
          
          // Restauram step-ul
          if (formData.step) {
            setStep(formData.step);
          } else if (locationState.step) {
            setStep(locationState.step);
          }
        } catch (error) {
          console.error('Error restoring form data:', error);
        }
      } else {
        // Dacă nu avem date salvate, doar restauram step-ul
        if (locationState.step) {
          setStep(locationState.step);
        }
      }
      
      // Scroll la secțiunea de comandă
      setTimeout(() => {
        const element = document.getElementById('comanda');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      setIsInitialized(true);
      // Ștergem state-ul din location pentru a nu păstra datele la refresh
      window.history.replaceState({}, document.title);
    } else if (!isInitialized) {
      // Dacă nu venim de la PaymentPage, resetăm totul (la refresh sau navigare normală)
      // Ștergem orice date salvate
      sessionStorage.removeItem('paymentPageData');
      sessionStorage.removeItem('homePageFormData');
      setIsInitialized(true);
    }
  }, [location.state, isInitialized]);

  // Order form state - EORI Code
  const [step, setStep] = useState(1);
  const [requestType, setRequestType] = useState<'obtinere' | 'modificare'>('obtinere'); // Pasul 1: Tip solicitare
  const [applicantType, setApplicantType] = useState<string>(''); // Pasul 2: Tip solicitant
  const [cui, setCui] = useState(''); // Pasul 3: CUI/CIF solicitant
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [error, setError] = useState('');
  const [_orderId, _setOrderId] = useState<number | null>(null);
  const [_documentPurposeOpen, _setDocumentPurposeOpen] = useState(false);
  const [_extractTypeOpen, _setExtractTypeOpen] = useState(false);
  const [contactData, setContactData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [phoneCountryCode, setPhoneCountryCode] = useState('+40'); // Default: România
  const [_contactError, _setContactError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [phoneCountryCodeOpen, setPhoneCountryCodeOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isPdfModalClosing, setIsPdfModalClosing] = useState(false);
  const [isPdfModalOpening, setIsPdfModalOpening] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(true);
  const [pdfType, setPdfType] = useState<'company' | 'individual' | 'beneficiari_reali_company' | 'beneficiari_reali_individual' | 'istoric_company'>('company');
  
  // EORI Image Modal state
  const [isEoriModalOpen, setIsEoriModalOpen] = useState(false);
  const [isEoriModalClosing, setIsEoriModalClosing] = useState(false);
  const [isEoriModalOpening, setIsEoriModalOpening] = useState(false);
  const [isEoriImageLoading, setIsEoriImageLoading] = useState(true);
  const [eoriImageType, setEoriImageType] = useState<'etapa1' | 'etapa2'>('etapa1');

  // Removed - no longer needed for EORI form
  
  // Billing form state - moved to HomePage to persist data
  const [billingType, setBillingType] = useState<'company' | 'other_company' | 'individual'>('company');
  const [billingCui, setBillingCui] = useState('');
  const [billingCompanyData, setBillingCompanyData] = useState<CompanyData | null>(null);
  const [_billingCuiLoading, _setBillingCuiLoading] = useState(false);
  const [billingCuiError, setBillingCuiError] = useState('');
  const [_billingFormData, _setBillingFormData] = useState({
    firstName: '',
    lastName: '',
  });

  const handleSearch = async () => {
    if (!cui || !/^\d+$/.test(cui)) {
      setError('CUI invalid. Te rugăm să introduci un CUI valid format doar din cifre.');
      setCompanyData(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/search', { cui });
      if (response.data.success && response.data.data) {
        setCompanyData(response.data.data);
        setError(''); // Clear any previous errors
        // Nu mai trecem automat la pasul următor - rămânem la pasul 3
      } else {
        setError(response.data?.error || 'CUI-ul introdus nu a fost găsit în baza de date ANAF. Te rugăm să verifici și să încerci din nou.');
        setCompanyData(null);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      const errorMessage = err.response?.data?.error || 'Eroare la căutare';
      setError(errorMessage);
      setCompanyData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCuiChange = (value: string) => {
    setCui(value);
    // Resetăm eroarea și datele când utilizatorul modifică CUI-ul
    if (error) {
      setError('');
    }
    if (companyData) {
      setCompanyData(null);
    }
  };

  const _handleBillingCuiSearch = async () => {
    if (!billingCui || !/^\d+$/.test(billingCui)) {
      setBillingCuiError('CUI invalid. Te rugăm să introduci un CUI valid format doar din cifre.');
      setBillingCompanyData(null);
      return;
    }

    _setBillingCuiLoading(true);
    setBillingCuiError('');

    try {
      const response = await axios.post('/api/search', { cui: billingCui });
      if (response.data.success && response.data.data) {
        setBillingCompanyData(response.data.data);
        setBillingCuiError('');
      } else {
        setBillingCuiError(response.data?.error || 'CUI-ul introdus nu a fost găsit în baza de date ANAF.');
        setBillingCompanyData(null);
      }
    } catch (err: any) {
      console.error('Billing CUI search error:', err);
      const errorMessage = err.response?.data?.error || 'Eroare la căutare';
      setBillingCuiError(errorMessage);
      setBillingCompanyData(null);
    } finally {
      _setBillingCuiLoading(false);
    }
  };

  const _handleBillingCuiChange = (value: string) => {
    setBillingCui(value);
    if (billingCuiError) {
      setBillingCuiError('');
    }
    if (billingCompanyData) {
      setBillingCompanyData(null);
    }
  };

  const _handleContinueToStep2 = () => {
    if (companyData) {
      setStep(2);
    }
  };

  // Removed - no longer needed for EORI form

  const _handleBillingContinue = () => {
    // Doar validăm și trecem la pasul următor, fără să creăm comanda
    if (billingType === 'other_company' && !billingCompanyData) {
      return; // Nu ar trebui să ajungă aici dacă validarea este corectă
    }
    setStep(4);
  };

  // Validare email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validare telefon
  const validatePhone = (phone: string, countryCode: string): boolean => {
    // Eliminăm spațiile și caracterele non-numerice (păstrăm doar cifrele)
    const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d]/g, '');
    
    // Validare în funcție de prefix
    if (countryCode === '+40') {
      // România: 9 cifre (fără prefix)
      return /^[0-9]{9}$/.test(cleanPhone);
    } else if (countryCode === '+1') {
      // SUA/Canada: 10 cifre
      return /^[0-9]{10}$/.test(cleanPhone);
    } else if (countryCode === '+44') {
      // UK: 10-11 cifre
      return /^[0-9]{10,11}$/.test(cleanPhone);
    } else {
      // Pentru alte țări, minim 7 cifre, maxim 15
      return /^[0-9]{7,15}$/.test(cleanPhone);
    }
  };

  const handleEmailChange = (value: string) => {
    setContactData({ ...contactData, email: value });
    if (value && !validateEmail(value)) {
      setEmailError('Email invalid. Te rugăm să introduci un email valid (ex: nume@example.com)');
    } else {
      setEmailError('');
    }
  };

  const handlePhoneChange = (value: string) => {
    // Eliminăm prefixul dacă utilizatorul îl introduce manual
    const cleanValue = value.replace(/^\+[0-9]+\s*/, '').replace(/\s+/g, '');
    setContactData({ ...contactData, phone: cleanValue });
    if (cleanValue && !validatePhone(cleanValue, phoneCountryCode)) {
      if (phoneCountryCode === '+40') {
        setPhoneError('Număr invalid. Te rugăm să introduci un număr românesc valid (9 cifre, ex: 712345678)');
      } else {
        setPhoneError('Număr invalid. Te rugăm să introduci un număr valid.');
      }
    } else {
      setPhoneError('');
    }
  };

  const _handleOpenPdfModal = (type: 'company' | 'individual' | 'beneficiari_reali_company' | 'beneficiari_reali_individual' | 'istoric_company' = 'company') => {
    // Resetăm starea de închidere dacă există
    setIsPdfModalClosing(false);
    setIsPdfLoading(true); // Resetăm loading când deschidem modalul
    setPdfType(type); // Setăm tipul PDF-ului
    
    // Prevenim scroll-ul paginii
    document.body.style.overflow = 'hidden';
    
    // Setăm starea de deschidere și deschidem modalul simultan
    setIsPdfModalOpening(true);
    setIsPdfModalOpen(true);
    // Forțăm re-render pentru animație instantanee
    requestAnimationFrame(() => {
      // După ce animația de deschidere se termină, resetăm flag-ul
      setTimeout(() => {
        setIsPdfModalOpening(false);
      }, 300);
    });
  };

  const handleClosePdfModal = () => {
    setIsPdfModalClosing(true);
    setTimeout(() => {
      setIsPdfModalOpen(false);
      setIsPdfModalClosing(false);
    }, 300); // Durata animației de închidere
  };

  const handleOpenEoriModal = (type: 'etapa1' | 'etapa2') => {
    setIsEoriModalClosing(false);
    setIsEoriImageLoading(true);
    setEoriImageType(type);
    
    // Prevenim scroll-ul paginii
    document.body.style.overflow = 'hidden';
    
    // Animație de deschidere
    setIsEoriModalOpening(true);
    setIsEoriModalOpen(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        setIsEoriModalOpening(false);
      }, 300);
    });
  };

  const handleCloseEoriModal = () => {
    setIsEoriModalClosing(true);
    setTimeout(() => {
      setIsEoriModalOpen(false);
      setIsEoriModalClosing(false);
      // Restaurăm scroll-ul paginii
      document.body.style.overflow = '';
    }, 300);
  };

  const _handleContactContinue = () => {
    // Resetăm erorile
    _setContactError('');
    setEmailError('');
    setPhoneError('');

    // Validare câmpuri obligatorii
    if (!contactData.firstName || !contactData.lastName) {
      _setContactError('Te rugăm să completezi numele și prenumele.');
      return;
    }

    // Validare email
    if (!contactData.email) {
      setEmailError('Email-ul este obligatoriu.');
      return;
    }
    if (!validateEmail(contactData.email)) {
      setEmailError('Email invalid. Te rugăm să introduci un email valid (ex: nume@example.com)');
      return;
    }

    // Validare telefon (dacă este completat)
    if (contactData.phone && !validatePhone(contactData.phone, phoneCountryCode)) {
      if (phoneCountryCode === '+40') {
        setPhoneError('Număr invalid. Te rugăm să introduci un număr românesc valid (9 cifre, ex: 712345678)');
      } else {
        setPhoneError('Număr invalid. Te rugăm să introduci un număr valid.');
      }
      return;
    }

    // Doar trecem la pasul următor, fără să creăm comanda
    setStep(5);
  };

  // Funcție pentru calcularea prețului în funcție de tipul documentului și extractType
  const _getDocumentPrice = (docType: string, extract?: string): number => {
    if (docType === 'certificat_beneficiar') {
      return 88;
    }
    if (docType === 'furnizare_info') {
      // Dacă este selectat "Raport istoric", prețul este 247 lei, altfel 165 lei
      if (extract === 'raport_istoric') {
        return 247;
      }
      return 165;
    }
    if (docType === 'certificat_istoric') {
      return 399;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-darkBlue-950">
      {/* Hero Section - Dark Blue Background */}
      <section id="hero" className="py-16 scroll-mt-20 pt-28 bg-darkBlue-950">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto items-start">
            {/* Left Box - Order Form */}
            <div id="comanda" className="bg-white rounded-lg shadow-xl p-8 relative scroll-mt-20">
              <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Cod EORI online</h2>
              <p className="text-gray-600 mb-6 text-sm">Eliberare automată în cel mai scurt timp</p>
              <p className="text-gray-700 mb-6 text-sm">
                Selectează tipul de solicitare pentru a obține codul EORI rapid, eliberat direct de către <strong>Autoritatea Vamală Română!</strong>
              </p>
              
              {/* Step 1 - Alege tip solicitare */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all ${
                    step >= 1 
                      ? step > 1 
                        ? 'bg-green-500 text-white border-green-600' 
                        : 'bg-orange-500 text-white border-orange-600'
                      : 'bg-gray-200 text-gray-600 border-gray-300'
                  }`}>
                    {step > 1 ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <CheckCircleIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-sm transition-colors ${
                    step >= 1 ? 'text-gray-700 font-medium' : 'text-gray-500'
                  }`}>
                    Alege tip solicitare
                  </span>
                </div>
                
                {step === 1 ? (
                  <div className="ml-11">
                    <h3 className="font-semibold text-gray-900 mb-2">1. Alege tip solicitare</h3>
                    {requestType && (
                      <p className="text-sm text-gray-600 mb-4">
                        {requestType === 'obtinere' ? 'Obținere cod EORI - 100 lei' : 'Modificare cod EORI - 100 lei'}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 mb-4">Solicitare de:</p>
                    <div className="space-y-3 mb-6">
                      <label className={`group flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        requestType === 'obtinere'
                          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-md'
                          : 'border-gray-200 hover:border-orange-300 bg-white'
                      }`}>
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-all ${
                          requestType === 'obtinere'
                            ? 'border-orange-500 bg-orange-500'
                            : 'border-gray-300 group-hover:border-orange-400'
                        }`}>
                          {requestType === 'obtinere' && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold text-gray-900 text-sm mb-1 ${
                            requestType === 'obtinere' ? 'text-orange-700' : ''
                          }`}>Obținere cod EORI - <span className="text-orange-600">100 lei</span></div>
                        </div>
                        <input
                          type="radio"
                          name="requestType"
                          value="obtinere"
                          checked={requestType === 'obtinere'}
                          onChange={() => setRequestType('obtinere')}
                          className="sr-only"
                        />
                      </label>
                      <label className={`group flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        requestType === 'modificare'
                          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-md'
                          : 'border-gray-200 hover:border-orange-300 bg-white'
                      }`}>
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-all ${
                          requestType === 'modificare'
                            ? 'border-orange-500 bg-orange-500'
                            : 'border-gray-300 group-hover:border-orange-400'
                        }`}>
                          {requestType === 'modificare' && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold text-gray-900 text-sm mb-1 ${
                            requestType === 'modificare' ? 'text-orange-700' : ''
                          }`}>Modificare cod EORI - <span className="text-orange-600">100 lei</span></div>
                        </div>
                        <input
                          type="radio"
                          name="requestType"
                          value="modificare"
                          checked={requestType === 'modificare'}
                          onChange={() => setRequestType('modificare')}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      disabled={!requestType}
                      className="w-full bg-darkBlue-900 hover:bg-darkBlue-950 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
                    >
                      <span>Mai departe</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                ) : step > 1 ? (
                  <div className="ml-11">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm">1. Alege tip solicitare</h3>
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="font-semibold text-gray-900 text-sm">
                        {requestType === 'obtinere' ? 'Obținere cod EORI' : 'Modificare cod EORI'} - 100 lei
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Step 2 - Alege solicitant */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all ${
                    step >= 2 
                      ? step > 2 
                        ? 'bg-green-500 text-white border-green-600' 
                        : 'bg-orange-500 text-white border-orange-600'
                      : 'bg-gray-200 text-gray-600 border-gray-300'
                  }`}>
                    {step > 2 ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      '2'
                    )}
                  </div>
                  <span className={`text-sm transition-colors ${
                    step >= 2 ? 'text-gray-700 font-medium' : 'text-gray-500'
                  }`}>
                    Alege solicitant
                  </span>
                </div>
                
                {step === 2 ? (
                  <div className="ml-11">
                    <h3 className="font-semibold text-gray-900 mb-2">2. Alege solicitant</h3>
                    {applicantType && (
                      <p className="text-sm text-gray-600 mb-4">
                        {applicantType === 'srl_sa' && 'SRL / SA înregistrată în România'}
                        {applicantType === 'pfa_ii_if' && 'PFA / II / IF înregistrată în România'}
                        {applicantType === 'persoana_fizica' && 'Persoană fizică cu resedință în România'}
                        {applicantType === 'asociatii' && 'Asociații și Instituții'}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 mb-4">Solicit codul EORI pentru:</p>
                    <div className="space-y-3 mb-6">
                      <label className={`group flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        applicantType === 'srl_sa'
                          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-md'
                          : 'border-gray-200 hover:border-orange-300 bg-white'
                      }`}>
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-all ${
                          applicantType === 'srl_sa'
                            ? 'border-orange-500 bg-orange-500'
                            : 'border-gray-300 group-hover:border-orange-400'
                        }`}>
                          {applicantType === 'srl_sa' && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold text-gray-900 text-sm ${
                            applicantType === 'srl_sa' ? 'text-orange-700' : ''
                          }`}>SRL / SA înregistrată în România</div>
                        </div>
                        <input
                          type="radio"
                          name="applicantType"
                          value="srl_sa"
                          checked={applicantType === 'srl_sa'}
                          onChange={(e) => setApplicantType(e.target.value)}
                          className="sr-only"
                        />
                      </label>
                      <label className={`group flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        applicantType === 'pfa_ii_if'
                          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-md'
                          : 'border-gray-200 hover:border-orange-300 bg-white'
                      }`}>
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-all ${
                          applicantType === 'pfa_ii_if'
                            ? 'border-orange-500 bg-orange-500'
                            : 'border-gray-300 group-hover:border-orange-400'
                        }`}>
                          {applicantType === 'pfa_ii_if' && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold text-gray-900 text-sm ${
                            applicantType === 'pfa_ii_if' ? 'text-orange-700' : ''
                          }`}>PFA / II / IF înregistrată în România</div>
                        </div>
                        <input
                          type="radio"
                          name="applicantType"
                          value="pfa_ii_if"
                          checked={applicantType === 'pfa_ii_if'}
                          onChange={(e) => setApplicantType(e.target.value)}
                          className="sr-only"
                        />
                      </label>
                      <label className={`group flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        applicantType === 'persoana_fizica'
                          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-md'
                          : 'border-gray-200 hover:border-orange-300 bg-white'
                      }`}>
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-all ${
                          applicantType === 'persoana_fizica'
                            ? 'border-orange-500 bg-orange-500'
                            : 'border-gray-300 group-hover:border-orange-400'
                        }`}>
                          {applicantType === 'persoana_fizica' && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold text-gray-900 text-sm ${
                            applicantType === 'persoana_fizica' ? 'text-orange-700' : ''
                          }`}>Persoană fizică cu resedință în România</div>
                        </div>
                        <input
                          type="radio"
                          name="applicantType"
                          value="persoana_fizica"
                          checked={applicantType === 'persoana_fizica'}
                          onChange={(e) => setApplicantType(e.target.value)}
                          className="sr-only"
                        />
                      </label>
                      <label className={`group flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        applicantType === 'asociatii'
                          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-md'
                          : 'border-gray-200 hover:border-orange-300 bg-white'
                      }`}>
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-all ${
                          applicantType === 'asociatii'
                            ? 'border-orange-500 bg-orange-500'
                            : 'border-gray-300 group-hover:border-orange-400'
                        }`}>
                          {applicantType === 'asociatii' && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold text-gray-900 text-sm ${
                            applicantType === 'asociatii' ? 'text-orange-700' : ''
                          }`}>Asociații și Instituții</div>
                        </div>
                        <input
                          type="radio"
                          name="applicantType"
                          value="asociatii"
                          checked={applicantType === 'asociatii'}
                          onChange={(e) => setApplicantType(e.target.value)}
                          className="sr-only"
                        />
                      </label>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        ← Înapoi
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        disabled={!applicantType}
                        className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-darkBlue-900 hover:bg-darkBlue-950 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                      >
                        Mai departe →
                      </button>
                    </div>
                  </div>
                ) : step > 2 && applicantType ? (
                  <div className="ml-11">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm">2. Alege solicitant</h3>
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="font-semibold text-gray-900 text-sm">
                        {applicantType === 'srl_sa' && 'SRL / SA înregistrată în România'}
                        {applicantType === 'pfa_ii_if' && 'PFA / II / IF înregistrată în România'}
                        {applicantType === 'persoana_fizica' && 'Persoană fizică cu resedință în România'}
                        {applicantType === 'asociatii' && 'Asociații și Instituții'}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Step 3 - Date solicitant */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all ${
                    step >= 3 
                      ? step > 3 
                        ? 'bg-green-500 text-white border-green-600' 
                        : 'bg-orange-500 text-white border-orange-600'
                      : 'bg-gray-200 text-gray-600 border-gray-300'
                  }`}>
                    {step > 3 ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      '3'
                    )}
                  </div>
                  <span className={`text-sm transition-colors ${
                    step >= 3 ? 'text-gray-700 font-medium' : 'text-gray-500'
                  }`}>
                    Date solicitant
                  </span>
                </div>
                
                {step === 3 ? (
                  <div className="ml-11">
                    <h3 className="font-semibold text-gray-900 mb-4">3. Date solicitant</h3>
                    <p className="text-sm text-gray-700 mb-4">Introdu datele solicitantului.</p>
                    
                    {/* CUI/CIF Input */}
                    <div className="mb-6 relative">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        CUI/CIF solicitant <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cui}
                          onChange={(e) => handleCuiChange(e.target.value)}
                          placeholder="CUI firmă"
                          className={`peer w-full px-4 py-3.5 text-base border-2 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${
                            error 
                              ? 'border-red-400 focus:border-red-500 focus:ring-red-200' 
                              : cui 
                                ? 'border-orange-400 focus:border-orange-500 focus:ring-orange-200' 
                                : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'
                          }`}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                          style={{ textAlign: 'left', paddingLeft: '16px', paddingRight: cui && !companyData ? '60px' : '16px' }}
                        />
                        {cui && !companyData && (
                          <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors disabled:bg-gray-400"
                          >
                            {loading ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <MagnifyingGlassIcon className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                      {error && (
                        <p className="mt-2 text-xs text-red-600">{error}</p>
                      )}
                      {companyData && (
                        <div className="mt-4 p-4 bg-gradient-to-br from-darkBlue-50 to-darkBlue-100 border-2 border-darkBlue-300 rounded-xl shadow-md">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-bold text-darkBlue-900 text-sm mb-2">{companyData.name}</p>
                              <p className="text-xs text-darkBlue-700">CUI/CIF: {companyData.cui}</p>
                              {companyData.registrationNumber && (
                                <p className="text-xs text-darkBlue-700">Reg.Com.: {companyData.registrationNumber}</p>
                              )}
                              {companyData.address && (
                                <p className="text-xs text-darkBlue-700 mt-1">{companyData.address}</p>
                              )}
                            </div>
                            <div className="ml-3 flex-shrink-0">
                              <div className="w-8 h-8 bg-darkBlue-600 rounded-full flex items-center justify-center shadow-lg">
                                <CheckCircleIcon className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Email Input */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        E-mail <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={contactData.email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        onBlur={(e) => {
                          if (e.target.value && !validateEmail(e.target.value)) {
                            setEmailError('Email invalid. Te rugăm să introduci un email valid (ex: nume@example.com)');
                          }
                        }}
                        placeholder="Adresa unde veţi primi documentul"
                        className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                          emailError ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {emailError && (
                        <p className="mt-1 text-xs text-red-600">{emailError}</p>
                      )}
                    </div>

                    {/* Phone Input */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Telefon <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setPhoneCountryCodeOpen(!phoneCountryCodeOpen)}
                            className={`px-4 py-3 text-sm border-2 rounded-xl transition-all flex items-center ${
                              phoneCountryCodeOpen
                                ? 'border-orange-600 bg-orange-50'
                                : 'border-gray-300 bg-white hover:border-orange-400'
                            }`}
                          >
                            <span className="text-sm font-medium">{phoneCountryCode}</span>
                            <ChevronDownIcon 
                              className={`w-4 h-4 ml-1 text-gray-400 transition-transform duration-200 ${
                                phoneCountryCodeOpen ? 'transform rotate-180' : ''
                              }`} 
                            />
                          </button>
                          
                          {phoneCountryCodeOpen && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setPhoneCountryCodeOpen(false)}
                              ></div>
                              <div className="absolute z-20 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto min-w-[200px]">
                                {countryCodes.map((country: { code: string; country: string; label: string }) => (
                                  <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => {
                                      setPhoneCountryCode(country.code);
                                      setPhoneCountryCodeOpen(false);
                                      if (contactData.phone) {
                                        handlePhoneChange(contactData.phone);
                                      }
                                    }}
                                    className={`w-full px-3 py-2 text-sm text-left hover:bg-orange-50 transition-colors flex items-center justify-between ${
                                      phoneCountryCode === country.code ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-700'
                                    }`}
                                  >
                                    <span>{country.label}</span>
                                    {phoneCountryCode === country.code && (
                                      <CheckCircleIcon className="w-4 h-4 text-orange-600" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="tel"
                            value={contactData.phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            onBlur={(e) => {
                              if (e.target.value && !validatePhone(e.target.value, phoneCountryCode)) {
                                if (phoneCountryCode === '+40') {
                                  setPhoneError('Număr invalid. Te rugăm să introduci un număr românesc valid (10 cifre, ex: 712345678)');
                                } else {
                                  setPhoneError('Număr invalid. Te rugăm să introduci un număr valid.');
                                }
                              }
                            }}
                            placeholder={phoneCountryCode === '+40' ? '712345678' : '123456789'}
                            className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                              phoneError ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {phoneError && (
                            <p className="mt-1 text-xs text-red-600">{phoneError}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => setStep(2)}
                        className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                      >
                        ← Înapoi
                      </button>
                      <button
                        onClick={() => setStep(4)}
                        disabled={
                          !cui || 
                          !contactData.email || 
                          !contactData.phone ||
                          Boolean(emailError) ||
                          Boolean(phoneError) ||
                          !validateEmail(contactData.email) ||
                          !validatePhone(contactData.phone, phoneCountryCode)
                        }
                        className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-darkBlue-900 hover:bg-darkBlue-950 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-colors"
                      >
                        Mai departe →
                      </button>
                    </div>
                  </div>
                ) : step > 3 ? (
                  <div className="ml-11">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm">3. Date solicitant</h3>
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      {companyData && (
                        <p className="text-xs text-gray-700 mb-1 font-semibold">{companyData.name}</p>
                      )}
                      <p className="text-xs text-gray-700">CUI/CIF: {cui}</p>
                      <p className="text-xs text-gray-700">Email: {contactData.email}</p>
                      <p className="text-xs text-gray-700">Telefon: {phoneCountryCode} {contactData.phone}</p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Step 4 - Plată */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all ${
                    step >= 4 
                      ? step > 4 
                        ? 'bg-green-500 text-white border-green-600' 
                        : 'bg-orange-500 text-white border-orange-600'
                      : 'bg-gray-200 text-gray-600 border-gray-300'
                  }`}>
                    {step > 4 ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      '4'
                    )}
                  </div>
                  <span className={`text-sm transition-colors ${
                    step >= 4 ? 'text-gray-700 font-medium' : 'text-gray-500'
                  }`}>
                    Confirmare
                  </span>
                </div>
                
                {step === 4 ? (
                  <div className="ml-11">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">4. Confirmare și plată</h3>
                    <PaymentForm
                      companyData={companyData}
                      documentType={requestType === 'obtinere' ? 'obtinere_eori' : 'modificare_eori'}
                      applicantType={applicantType}
                      contactData={contactData}
                      phoneCountryCode={phoneCountryCode}
                      onBack={() => setStep(3)}
                    />
                  </div>
                ) : step > 4 ? (
                  <div className="ml-11">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm">4. Confirmare</h3>
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-700">Plata a fost procesată cu succes</p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Step 6 - Confirmare finală */}
              {step === 6 && (
                <div className="mb-6">
                  <div className="ml-11">
                    <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-gray-900">
                        Comandă finalizată cu succes!
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Certificatul va fi generat și trimis pe email în câteva minute.
                      </p>
                      <button
                        onClick={() => {
                          setStep(1);
                          setCui('');
                          setCompanyData(null);
                          setRequestType('obtinere');
                          setApplicantType('');
                          _setOrderId(null);
                          setBillingCui('');
                          setBillingCompanyData(null);
                          _setBillingFormData({ firstName: '', lastName: '' });
                          setContactData({ firstName: '', lastName: '', email: '', phone: '' });
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        Comandă nouă
                      </button>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* Right Box - Advantages Section */}
            <div className="bg-white rounded-lg shadow-xl p-8 relative">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Avantajele emiterii <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded">online</span>
                </h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">Expertiză aprofundată în reglementări vamale.</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">Răspunsuri rapide și eficiente.</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">Procese simplificate pentru clienți.</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">Securitate totală a datelor.</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">Monitorizare și actualizări în timp real.</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">Preţurile afişate sunt preţurile finale.</span>
                  </div>
                </div>

                {/* EORI Code Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">
                    Vezi aici cum arată un cod EORI:
                  </h3>
                  <div className="space-y-3 mb-4">
                    <button 
                      onClick={() => handleOpenEoriModal('etapa1')}
                      className="w-full bg-darkBlue-900 hover:bg-darkBlue-950 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm"
                    >
                      Cum îl vei primi
                    </button>
                    <button 
                      onClick={() => handleOpenEoriModal('etapa2')}
                      className="w-full bg-darkBlue-800 hover:bg-darkBlue-900 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm"
                    >
                      Cum îl vei folosi
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">
                    După ce veți primi codul, acesta trebuie salvat conform instrucţiunilor din e-mail pentru a putea fi folosit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer to push prices section down */}
      <div className="h-32"></div>

      {/* Organic Transition from White to Dark Blue */}
      <div className="relative w-full h-20 overflow-hidden pointer-events-none z-10 -mt-20">
        <svg
          className="absolute top-0 w-full h-full"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="whiteToDarkBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="25%" stopColor="#bae6fd" />
              <stop offset="50%" stopColor="#7dd3fc" />
              <stop offset="75%" stopColor="#0ea5e9" />
              <stop offset="90%" stopColor="#0c4a6e" />
              <stop offset="100%" stopColor="#082f49" />
            </linearGradient>
          </defs>
          {/* Main organic wave */}
          <path
            d="M0,0 
               C180,10 320,30 480,25 
               C640,20 720,40 880,32 
               C1040,25 1120,45 1280,37 
               C1360,34 1400,50 1440,55 
               L1440,100 
               L0,100 
               L0,0 Z"
            fill="url(#whiteToDarkBlueGradient)"
          />
        </svg>
      </div>

      {/* Prices Section - Dark Blue Background */}
      <section id="preturi" className="pt-12 pb-20 bg-darkBlue-950 scroll-mt-20 relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Prețuri</h2>
          <p className="text-center text-gray-300 mb-12 text-lg">
            Alege serviciul potrivit pentru nevoile tale
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Service Card 1 - Obținere Cod EORI */}
            <div className="bg-white rounded-lg shadow-xl p-8 hover:shadow-2xl transition-shadow flex flex-col h-full">
              <h3 className="text-xl font-bold mb-4 text-darkBlue-900 text-center uppercase">OBŢINERE COD EORI</h3>
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-orange-500">100</span>
                <span className="text-gray-600 ml-1 text-xl">lei</span>
              </div>
              <div className="flex-1 mb-6">
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mr-2 mt-0.5" />
                    <span>Eliberare Cod EORI de către Autoritatea Vamală Română.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mr-2 mt-0.5" />
                    <span>Procesare rapidă și eficientă.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mr-2 mt-0.5" />
                    <span>Confirmare prin email și Whatsapp în timp real.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mr-2 mt-0.5" />
                    <span>Verificare disponibilitate și stare cerere online.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mr-2 mt-0.5" />
                    <span>Tarife transparente, fără costuri ascunse.</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setRequestType('obtinere');
                  setStep(1);
                  setTimeout(() => {
                    document.getElementById('comanda')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="bg-darkBlue-900 hover:bg-darkBlue-950 text-white font-bold py-4 px-6 rounded-lg transition-colors w-full uppercase shadow-lg hover:shadow-xl"
              >
                SOLICITĂ
              </button>
            </div>

            {/* Service Card 2 - Modificare Cod EORI */}
            <div className="bg-white rounded-lg shadow-xl p-8 hover:shadow-2xl transition-shadow flex flex-col h-full">
              <h3 className="text-xl font-bold mb-4 text-darkBlue-900 text-center uppercase">MODIFICARE COD EORI</h3>
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-orange-500">100</span>
                <span className="text-gray-600 ml-1 text-xl">lei</span>
              </div>
              <div className="flex-1 mb-6">
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mr-2 mt-0.5" />
                    <span>Actualizare rapidă a datelor EORI.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mr-2 mt-0.5" />
                    <span>Suport pentru modificări 24/7.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mr-2 mt-0.5" />
                    <span>Notificări instantanee despre statutul cererii.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mr-2 mt-0.5" />
                    <span>Conformitate garantată cu reglementările vamale.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mr-2 mt-0.5" />
                    <span>Monitorizare și raportare stare cerere în timp real.</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setRequestType('modificare');
                  setStep(1);
                  setTimeout(() => {
                    document.getElementById('comanda')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="bg-darkBlue-900 hover:bg-darkBlue-950 text-white font-bold py-4 px-6 rounded-lg transition-colors w-full uppercase shadow-lg hover:shadow-xl"
              >
                SOLICITĂ
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* EORI Code Information Section */}
      <section className="py-20 bg-darkBlue-950 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">Cum arată un cod EORI?</h2>
          
          {/* Prima secțiune - Poza stânga, Text dreapta */}
          <div className="bg-white rounded-xl shadow-2xl p-8 md:p-12 border-2 border-gray-100 mb-8">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Poza stânga */}
              <div className="rounded-lg overflow-hidden">
                <img 
                  src="/etapa 1.png" 
                  alt="Exemplu cod EORI primit pe email" 
                  className="w-full h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleOpenEoriModal('etapa1')}
                />
              </div>
              
              {/* Text dreapta */}
              <div className="space-y-4">
                <p className="text-darkBlue-700 text-lg font-semibold leading-relaxed">
                  Aşa va arăta codul EORI pe care îl veți primi pe adresa de email.
                </p>
                <p className="text-gray-700 text-base leading-relaxed">
                  În România, codul EORI este format din prefixul <strong>"RO"</strong> care indică țara, urmat de un număr de identificare, care poate fi <strong>Codul Numeric Personal (CNP)</strong> pentru persoane fizice sau <strong>Codul Unic de Înregistrare (CUI)</strong> pentru companii.
                </p>
              </div>
            </div>
          </div>

          {/* A doua secțiune - Text stânga, Poza dreapta */}
          <div className="bg-white rounded-xl shadow-2xl p-8 md:p-12 border-2 border-gray-100">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Text stânga */}
              <div className="space-y-4 order-2 md:order-1">
                <p className="text-darkBlue-700 text-lg font-semibold leading-relaxed">
                  Așa va arăta codul EORI pe care va trebui să îl trimiteți curierului.
                </p>
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                  <p className="text-gray-800 text-sm leading-relaxed">
                    <strong className="text-orange-700">Recomandare:</strong> Se recomandă salvarea acestui cod conform instrucţiunilor primite prin e-mail, adică într-un document Word utilizând fontul <strong>Lucida Console</strong> cu dimensiunea fontului de <strong>8</strong>.
                  </p>
                </div>
              </div>
              
              {/* Poza dreapta */}
              <div className="rounded-lg overflow-hidden order-1 md:order-2">
                <img 
                  src="/etapa 2.png" 
                  alt="Exemplu cod EORI pentru curier" 
                  className="w-full h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleOpenEoriModal('etapa2')}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smooth Transition from Dark Blue to White */}
      <div className="relative w-full h-32 -mb-32 overflow-hidden pointer-events-none z-10">
        <svg
          className="absolute top-0 w-full h-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="smoothDarkBlueToWhite" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#082f49" />
              <stop offset="30%" stopColor="#0c4a6e" />
              <stop offset="60%" stopColor="#7dd3fc" />
              <stop offset="85%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
          {/* Simple smooth wave */}
          <path
            d="M0,80 
               Q360,40 720,60 
               T1440,50 
               L1440,0 
               L0,0 
               Z"
            fill="url(#smoothDarkBlueToWhite)"
          />
        </svg>
      </div>

      {/* FAQ Section - White Background */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-xl p-8 md:p-12 border-2 border-gray-100">
            <h2 className="text-4xl font-bold text-center text-darkBlue-900 mb-3">
              Întrebări frecvente
            </h2>
            <p className="text-center text-darkBlue-700 text-lg mb-12">
              Află răspunsurile la cele mai frecvente întrebări
            </p>

            <div className="space-y-10">
              {/* Question 1 */}
              <div>
                <h3 className="text-xl font-bold text-darkBlue-900 mb-4 flex items-start">
                  <span className="text-orange-500 mr-3">1.</span>
                  <span>Ce este codul EORI și de ce am nevoie de el?</span>
                </h3>
                <div className="ml-8 space-y-3 text-gray-700 leading-relaxed">
                  <p>
                    Codul EORI (Economic Operators Registration and Identification) este un număr unic folosit pentru identificarea operatorilor economici și a altor entități în relația cu autoritățile vamale din Uniunea Europeană.
                  </p>
                  <p>
                    Este esențial pentru efectuarea oricăror activități de import sau export în UE, facilitând procedurile vamale și asigurând un schimb de informații rapid și sigur între companii și autorități.
                  </p>
                </div>
              </div>

              {/* Question 2 */}
              <div>
                <h3 className="text-xl font-bold text-darkBlue-900 mb-4 flex items-start">
                  <span className="text-orange-500 mr-3">2.</span>
                  <span>Cum pot obține un cod EORI prin intermediul eori-cod.ro?</span>
                </h3>
                <div className="ml-8 space-y-3 text-gray-700 leading-relaxed">
                  <p>
                    Pentru a obține un cod EORI prin serviciul nostru, trebuie să completați formularul de cerere disponibil pe site-ul nostru, să achitați taxa de serviciu și să furnizați documentația necesară.
                  </p>
                  <p>
                    Noi ne ocupăm de restul, asigurându-ne că cererea dumneavoastră este procesată rapid și eficient, iar codul EORI vă este livrat în cel mai scurt timp posibil.
                  </p>
                </div>
              </div>

              {/* Question 3 */}
              <div>
                <h3 className="text-xl font-bold text-darkBlue-900 mb-4 flex items-start">
                  <span className="text-orange-500 mr-3">3.</span>
                  <span>Ce documente sunt necesare pentru obținerea/modificarea codului EORI?</span>
                </h3>
                <div className="ml-8 space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Documentația necesară pentru obținerea sau modificarea codului EORI poate varia în funcție de specificul activității dumneavoastră comerciale și de jurisdicția în care operați. În general, este necesar să furnizați date despre identitatea și adresa companiei, informații legale și comerciale, precum și alte detalii relevante pentru cererea dumneavoastră.
                  </p>
                  
                  <div className="space-y-4 mt-6">
                    <div>
                      <h4 className="font-semibold text-darkBlue-800 mb-2 flex items-center">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                        Persoane fizice înregistrate în România:
                      </h4>
                      <ul className="ml-7 space-y-1">
                        <li className="flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          <span>Carte de identitate / Permis de ședere față-verso / Certificat de înregistrare, în termen de valabilitate.</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-darkBlue-800 mb-2 flex items-center">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                        SRL / SA:
                      </h4>
                      <ul className="ml-7 space-y-1">
                        <li className="flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          <span>Certificatul de înregistrare;</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          <span>Act Constitutiv / Statut;</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          <span>Certificatul de înregistrare în scopuri de TVA, în cazul plătitorilor de TVA.</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-darkBlue-800 mb-2 flex items-center">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                        PFA / II / IF:
                      </h4>
                      <ul className="ml-7 space-y-1">
                        <li className="flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          <span>Certificatul de înregistrare;</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          <span>Certificatul de înregistrare în scopuri de TVA, în cazul plătitorilor de TVA;</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          <span>Rezoluția ONRC de la înființare.</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-darkBlue-800 mb-2 flex items-center">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                        Asociații și Instituții:
                      </h4>
                      <ul className="ml-7 space-y-1">
                        <li className="flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          <span>Certificat de înregistrare fiscală;</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          <span>Act Constitutiv / Statut;</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          <span>Certificatul de înregistrare în scopuri de TVA, în cazul plătitorilor de TVA.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question 4 */}
              <div>
                <h3 className="text-xl font-bold text-darkBlue-900 mb-4 flex items-start">
                  <span className="text-orange-500 mr-3">4.</span>
                  <span>Cât timp durează procesul de obținere a Codului EORI?</span>
                </h3>
                <div className="ml-8 space-y-3 text-gray-700 leading-relaxed">
                  <p>
                    Timpul necesar pentru obținerea Codului EORI poate varia, însă ne angajăm să optimizăm acest proces cât mai mult posibil. În general, codurile EORI sunt emise în câteva zile lucrătoare de la depunerea completă și corectă a cererii și a tuturor documentelor necesare.
                  </p>
                  <p>
                    De asemenea, vă vom ține la curent cu progresul cererii dumneavoastră.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EORI Image Modal */}
      {(isEoriModalOpen || isEoriModalClosing) && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          style={{
            opacity: isEoriModalClosing ? 0 : 1,
            transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isEoriModalClosing) {
              handleCloseEoriModal();
            }
          }}
        >
          {/* Modal Content with Animation */}
          <div 
            className="relative w-full h-full max-w-5xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden"
            style={{
              transform: isEoriModalClosing 
                ? 'scale(0.75)' 
                : isEoriModalOpening 
                  ? 'scale(0.85)' 
                  : 'scale(1)',
              opacity: isEoriModalClosing ? 0 : isEoriModalOpening ? 0.7 : 1,
              transformOrigin: 'center center',
              transition: isEoriModalOpening 
                ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseEoriModal}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              aria-label="Închide"
            >
              <XMarkIcon className="w-6 h-6 text-gray-700" />
            </button>

            {/* Image Viewer */}
            <div className="w-full h-full overflow-auto bg-white relative flex items-center justify-center p-8">
              {/* Loading Spinner */}
              {isEoriImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-20">
                  <div className="flex flex-col items-center space-y-4">
                    <ArrowPathIcon className="w-12 h-12 text-orange-500 animate-spin" />
                    <p className="text-gray-600 text-sm">Se încarcă imaginea...</p>
                  </div>
                </div>
              )}
              
              {/* Image */}
              <img 
                src={eoriImageType === 'etapa1' ? "/etapa 1.png" : "/etapa 2.png"}
                alt={eoriImageType === 'etapa1' ? "Cum îl vei primi codul EORI" : "Cum îl vei folosi codul EORI"}
                className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                  isEoriImageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => {
                  setTimeout(() => {
                    setIsEoriImageLoading(false);
                  }, 200);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* PDF Modal */}
      {(isPdfModalOpen || isPdfModalClosing) && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          style={{
            opacity: isPdfModalClosing ? 0 : 1,
            transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isPdfModalClosing) {
              handleClosePdfModal();
            }
          }}
        >
          {/* Modal Content with Animation */}
          <div 
            className="relative w-full h-full max-w-5xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden"
            style={{
              transform: isPdfModalClosing 
                ? 'scale(0.75)' 
                : isPdfModalOpening 
                  ? 'scale(0.85)' 
                  : 'scale(1)',
              opacity: isPdfModalClosing ? 0 : isPdfModalOpening ? 0.7 : 1,
              transformOrigin: 'center center',
              transition: isPdfModalOpening 
                ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClosePdfModal}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              aria-label="Închide"
            >
              <XMarkIcon className="w-6 h-6 text-gray-700" />
            </button>

            {/* PDF Viewer */}
            <div className="w-full h-full overflow-auto bg-white relative">
              {/* Loading Spinner */}
              {isPdfLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-20">
                  <div className="flex flex-col items-center space-y-4">
                    <ArrowPathIcon className="w-12 h-12 text-primary-600 animate-spin" />
                    <p className="text-gray-600 text-sm">Se încarcă documentul...</p>
                  </div>
                </div>
              )}
              
              {/* PDF Iframe */}
              <iframe
                src={
                  pdfType === 'company' 
                    ? "/CC_OPENCODE_FULL.pdf#toolbar=0&navpanes=0&scrollbar=1&view=FitH"
                    : pdfType === 'individual'
                      ? "/CC_PF_FULL.pdf#toolbar=0&navpanes=0&scrollbar=1&view=FitH"
                      : pdfType === 'beneficiari_reali_company'
                        ? "/BR_OPENCODE_FULL.pdf#toolbar=0&navpanes=0&scrollbar=1&view=FitH"
                        : pdfType === 'beneficiari_reali_individual'
                          ? "/BR_PF_FULL.pdf#toolbar=0&navpanes=0&scrollbar=1&view=FitH"
                          : "/CC_ISTORIC_OPENCODE_FULL.pdf#toolbar=0&navpanes=0&scrollbar=1&view=FitH"
                }
                className={`w-full h-full min-h-[800px] border-0 bg-white transition-opacity duration-300 ${
                  isPdfLoading ? 'opacity-0' : 'opacity-100'
                }`}
                title={
                  pdfType === 'company' 
                    ? "Certificat Beneficiar Model - Firmă/PFA" 
                    : pdfType === 'individual'
                      ? "Certificat Beneficiar Model - Persoană Fizică"
                      : pdfType === 'beneficiari_reali_company'
                        ? "Beneficiari Reali Model - Firmă/PFA"
                        : pdfType === 'beneficiari_reali_individual'
                          ? "Beneficiari Reali Model - Persoană Fizică"
                          : "Certificat Beneficiar cu Istoric Model"
                }
                loading="eager"
                onLoad={() => {
                  // Când PDF-ul s-a încărcat, ascundem loading-ul
                  setTimeout(() => {
                    setIsPdfLoading(false);
                  }, 200); // Mic delay pentru smooth transition
                }}
                style={{
                  pointerEvents: 'auto',
                }}
                key={pdfType} // Force re-render when PDF type changes
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Billing Form Component - Not used in EORI form, removed to fix TypeScript errors

export default HomePage;
