import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeftIcon, CheckCircleIcon, DocumentIcon } from '@heroicons/react/24/outline';

interface CompanyData {
  cui: string;
  name: string;
  address: string;
  registrationNumber: string;
  phone: string;
  postalCode: string;
  status: string;
}

interface PaymentPageLocationState {
  companyData: CompanyData | null;
  documentType: string;
  documentPurpose?: string;
  extractType?: string;
  billingType: 'company' | 'other_company' | 'individual';
  billingCui: string;
  billingCompanyData: CompanyData | null;
  billingFormData: {
    firstName: string;
    lastName: string;
  };
  contactData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  phoneCountryCode?: string;
}

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PaymentPageLocationState;

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [email, setEmail] = useState(state?.contactData?.email || '');

  // Verificăm dacă avem datele necesare
  useEffect(() => {
    if (!state) {
      navigate('/');
    } else {
      setEmail(state.contactData.email);
    }
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  // Funcție pentru calcularea prețului în funcție de tipul documentului și extractType
  const getDocumentPrice = (docType: string, extract?: string): number => {
    // Servicii EORI - 100 lei
    if (docType === 'obtinere_eori' || docType === 'modificare_eori') {
      return 100;
    }
    // Servicii vechi ONRC
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

  const amount = getDocumentPrice(state.documentType, state.extractType);
  const amountWithVAT = Math.round(amount * 1.19 * 100) / 100; // 19% TVA

  const getDocumentName = () => {
    if (state.documentType === 'obtinere_eori') return 'Obținere cod EORI';
    if (state.documentType === 'modificare_eori') return 'Modificare cod EORI';
    if (state.documentType === 'certificat_beneficiar') return 'Certificat Constatat';
    if (state.documentType === 'furnizare_info') return 'Beneficiari Reali';
    if (state.documentType === 'certificat_istoric') return 'Constatator cu Istoric';
    return 'Certificat ONRC';
  };

  const handlePayment = async () => {
    if (!email) {
      setError('Te rugăm să introduci email-ul.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      setProcessing(true);

      // Pregătim datele pentru comandă
      let finalBillingCui = '';
      let finalBillingCompanyName = '';
      let finalBillingCompanyAddress = '';
      let finalBillingCompanyRegistration = '';
      let finalFirstName = '';
      let finalLastName = '';

      if (state.billingType === 'company') {
        // Folosim datele din certificat
        finalBillingCui = state.companyData?.cui || '';
        finalBillingCompanyName = state.companyData?.name || '';
      } else if (state.billingType === 'other_company') {
        // Folosim datele firmei de facturare
        finalBillingCui = state.billingCui || '';
        finalBillingCompanyName = state.billingCompanyData?.name || '';
        finalBillingCompanyAddress = state.billingCompanyData?.address || '';
        finalBillingCompanyRegistration = state.billingCompanyData?.registrationNumber || '';
      } else if (state.billingType === 'individual') {
        // Folosim datele persoanei fizice
        finalFirstName = state.billingFormData.firstName || state.contactData.firstName || '';
        finalLastName = state.billingFormData.lastName || state.contactData.lastName || '';
      }

          const orderPayload = {
            cui: state.companyData?.cui || '',
            companyName: state.companyData?.name || '',
            documentType: state.documentType,
            documentPurpose: state.documentType === 'certificat_beneficiar' ? (state.documentPurpose || null) : null,
            extractType: state.documentType === 'furnizare_info' ? (state.extractType || null) : null,
            billingType: state.billingType,
            billingCui: finalBillingCui || null,
            billingCompanyName: finalBillingCompanyName || '',
            billingCompanyAddress: finalBillingCompanyAddress || null,
            billingCompanyRegistration: finalBillingCompanyRegistration || null,
            // IMPORTANT: Pentru Netopia, folosim întotdeauna numele din Step 4 (Date de contact)
            // Nu din billing, pentru că Netopia afișează acest nume în dashboard
            firstName: state.contactData.firstName || finalFirstName || null,
            lastName: state.contactData.lastName || finalLastName || null,
            email: email,
            phone: state.contactData.phone ? `${state.phoneCountryCode || '+40'} ${state.contactData.phone}` : null,
          };

      console.log('Creating order with payload:', JSON.stringify(orderPayload, null, 2));

      // CREĂM COMANDA DOAR DUPĂ CE PLATA ESTE CONFIRMATĂ
      const orderResponse = await axios.post('/api/orders', orderPayload);

      if (!orderResponse.data.success) {
        throw new Error('Eroare la crearea comenzii');
      }

      const newOrderId = orderResponse.data.orderId;
      setOrderId(newOrderId);

      // Creăm comanda și apoi facem redirect către endpoint-ul care returnează HTML-ul Netopia
      // Acest endpoint va crea plata Netopia și va returna HTML-ul direct către browser
      const redirectUrl = `/api/payment/netopia/redirect/${newOrderId}?amount=${amountWithVAT}`;
      console.log('Redirecting to Netopia checkout:', redirectUrl);
      
      // Facem redirect către endpoint-ul care returnează HTML-ul Netopia
      window.location.href = redirectUrl;
      return;
    } catch (err: any) {
      console.error('Payment processing error:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Eroare la procesarea plății';
      setError(errorMessage);
      setProcessing(false);
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Navigăm înapoi la HomePage cu un flag și step-ul corect
    navigate('/', {
      state: {
        returnFromPayment: true,
        step: 5, // Revenim la pasul 5 (Plată)
      },
      replace: true,
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Plată finalizată cu succes!
          </h2>
          <p className="text-gray-600 mb-6">
            Comanda #{orderId} a fost procesată cu succes. Certificatul va fi generat și trimis pe email în câteva minute.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Înapoi la pagina principală
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Elaborate background with gradients and patterns - only white and purple */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-50"></div>
      
      {/* Animated gradient orbs - only purple */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      
      {/* Geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(30deg, transparent 40%, rgba(139, 92, 246, 0.5) 50%, transparent 60%),
            linear-gradient(60deg, transparent 40%, rgba(139, 92, 246, 0.3) 50%, transparent 60%),
            radial-gradient(circle at 2px 2px, rgb(139, 92, 246) 1px, transparent 0)
          `,
          backgroundSize: '60px 60px, 80px 80px, 40px 40px'
        }}></div>
      </div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `
          linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }}></div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine"></div>
      
      {/* Additional decorative elements - only purple */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary-100/20 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-100/20 rounded-full blur-3xl"></div>
      
      {/* Radial gradient overlay for depth - only purple */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(139, 92, 246, 0.05) 0%, transparent 50%)'
      }}></div>

      {/* Modern header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/60 py-5 relative z-10 shadow-lg">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 transition-all group"
            >
              <div className="bg-gradient-to-br from-gray-100 to-gray-50 group-hover:from-primary-100 group-hover:to-primary-50 rounded-xl p-2.5 transition-all group-hover:scale-110 shadow-sm group-hover:shadow-md border border-gray-200 group-hover:border-primary-200">
                <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform text-gray-600 group-hover:text-primary-600" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">Înapoi la</span>
                <span className="font-bold text-lg bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 bg-clip-text text-transparent group-hover:from-primary-600 group-hover:via-primary-700 group-hover:to-primary-600 transition-all">
                  constatator-online.ro
                </span>
              </div>
            </button>
            
            {/* Logo/Brand */}
            <div className="hidden md:flex items-center space-x-2 bg-primary-50 px-4 py-2 rounded-full border border-primary-100">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-primary-700">Plată securizată</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left Column - Certificate Example Only */}
          <div className="flex items-start">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 overflow-hidden relative w-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b-2 border-gray-200">
                <div className="flex items-center space-x-2">
                  <DocumentIcon className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-semibold text-gray-700">Exemplu</span>
                </div>
              </div>
              
              {/* Image with border */}
              <div className="relative w-full bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="relative border-4 border-gray-300 rounded-lg shadow-inner overflow-hidden bg-white">
                  <img
                    src="/Screenshot 2026-01-12 at 16.02.53.png"
                    alt="Exemplu certificat"
                    className="w-full h-auto object-contain block"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden">
            {/* Decorative accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/20 rounded-bl-full -mr-16 -mt-16"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-8 text-gray-900">Plată</h2>

              {/* Contact Information */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                  Informații de contact
                </label>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-2">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all bg-white"
                    required
                  />
                </div>
              </div>

              {/* Order Details - Visible at top */}
              <div className="mb-8 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide flex items-center">
                  <svg className="w-4 h-4 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Detalii comandă
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tip document:</span>
                    <span className="text-sm font-semibold text-gray-900">{getDocumentName()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Firmă:</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">{state.companyData?.name || 'firmă'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                    <span className="text-base font-semibold text-gray-700">Total de plată:</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                      {amountWithVAT.toFixed(2)} RON
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 pt-2">
                    Prețul include Tariful ONRC și TVA
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mb-8">
                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-2">
                        Plata securizată prin Netopia
                      </p>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        După apăsarea butonului "Plătiți", veți fi redirecționat către pagina securizată Netopia pentru a introduce datele cardului. Plata este procesată în siguranță și nu stocăm datele cardului.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Card logos */}
                <div className="flex items-center justify-center space-x-4 mt-6">
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/visa.svg" alt="Visa" className="h-6" />
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mastercard.svg" alt="Mastercard" className="h-6" />
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/americanexpress.svg" alt="Amex" className="h-6" />
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm shadow-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={loading || processing}
                className="w-full py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Se procesează...</span>
                  </>
                ) : (
                  <span>Plătiți {amountWithVAT.toFixed(2)} RON</span>
                )}
              </button>

              <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <span>Dezvoltat de</span>
                  <span className="font-semibold text-primary-600">Netopia</span>
                  <span className="mx-1">|</span>
                  <a href="#" className="hover:text-primary-600 transition-colors">Termeni</a>
                  <span className="mx-1">|</span>
                  <a href="#" className="hover:text-primary-600 transition-colors">Confidențialitate</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
