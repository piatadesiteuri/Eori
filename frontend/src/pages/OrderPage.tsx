import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import PaymentForm from '../components/PaymentForm';

interface CompanyData {
  cui: string;
  name: string;
  address: string;
  registrationNumber: string;
  phone: string;
  postalCode: string;
  status: string;
}

const OrderPage = () => {
  const [step, setStep] = useState(1);
  const [searchType, setSearchType] = useState<'cui' | 'cnp'>('cui');
  const [cui, setCui] = useState('');
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [error, setError] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [orderId, setOrderId] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!cui || !/^\d+$/.test(cui)) {
      setError('CUI invalid');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/search', { cui });
      if (response.data.success) {
        setCompanyData(response.data.data);
        setStep(2);
      } else {
        setError('Firma nu a fost găsită');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Eroare la căutare');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSelect = (type: string) => {
    setDocumentType(type);
    setStep(3);
  };

  const handleOrderCreated = (id: number) => {
    setOrderId(id);
    setStep(4);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Completează comanda
        </h1>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`flex-1 flex items-center ${
                s < 5 ? 'mr-2' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  s <= step
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s}
              </div>
              {s < 5 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    s < step ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Search Company */}
        {step === 1 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">
              1. Alege firma
            </h2>
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setSearchType('cui')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                  searchType === 'cui'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                FIRMĂ/PFA (PE CUI)
              </button>
              <button
                onClick={() => setSearchType('cnp')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                  searchType === 'cnp'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                PERSOANĂ FIZICĂ (PE CNP)
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completează aici CUI sau CIF *
              </label>
              <input
                type="text"
                value={cui}
                onChange={(e) => setCui(e.target.value)}
                placeholder="Introdu CUI/CIF"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <p className="text-xs text-gray-500 mt-1">
                CUI/CIF pentru care se solicită certificatul
              </p>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Căutare...</span>
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span>Caută firma</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Select Document */}
        {step === 2 && companyData && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">
              2. Alege document ONRC
            </h2>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold">{companyData.name}</p>
              <p className="text-sm text-gray-600">CUI: {companyData.cui}</p>
              <p className="text-sm text-gray-600">{companyData.address}</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => handleDocumentSelect('certificat_beneficiar')}
                className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
              >
                <div className="font-semibold">Certificat Beneficiar Real</div>
                <div className="text-sm text-gray-600">88 lei</div>
              </button>
              <button
                onClick={() => handleDocumentSelect('furnizare_info')}
                className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
              >
                <div className="font-semibold">
                  Furnizare Informații Beneficiari Reali
                </div>
                <div className="text-sm text-gray-600">165 lei</div>
              </button>
              <button
                onClick={() => handleDocumentSelect('certificat_istoric')}
                className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
              >
                <div className="font-semibold">
                  Certificat Beneficiar Real cu Istoric
                </div>
                <div className="text-sm text-gray-600">399 lei</div>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Billing Details */}
        {step === 3 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">
              3. Date de facturare
            </h2>
            <BillingForm
              companyData={companyData}
              documentType={documentType}
              onOrderCreated={handleOrderCreated}
            />
          </div>
        )}

        {/* Step 4: Payment */}
        {step === 4 && orderId && (
          <PaymentForm
            companyData={companyData}
            documentType={documentType}
            contactData={{
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
            }}
            onBack={() => setStep(3)}
          />
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div className="card text-center">
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
            <h2 className="text-2xl font-bold mb-4">
              Comandă finalizată cu succes!
            </h2>
            <p className="text-gray-600 mb-6">
              Certificatul va fi generat și trimis pe email în câteva minute.
            </p>
            <button
              onClick={() => {
                setStep(1);
                setCui('');
                setCompanyData(null);
                setDocumentType('');
                setOrderId(null);
              }}
              className="btn-primary"
            >
              Comandă nouă
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Billing Form Component
const BillingForm = ({
  companyData,
  documentType,
  onOrderCreated,
}: {
  companyData: CompanyData | null;
  documentType: string;
  onOrderCreated: (id: number) => void;
}) => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    billingName: '',
    billingAddress: '',
    billingCui: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/orders', {
        cui: companyData?.cui || '',
        companyName: companyData?.name || '',
        documentType,
        ...formData,
      });

      if (response.data.success) {
        onOrderCreated(response.data.orderId);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Eroare la crearea comenzii');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Telefon
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) =>
            setFormData({ ...formData, phone: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nume facturare *
        </label>
        <input
          type="text"
          required
          value={formData.billingName}
          onChange={(e) =>
            setFormData({ ...formData, billingName: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adresă facturare
        </label>
        <textarea
          value={formData.billingAddress}
          onChange={(e) =>
            setFormData({ ...formData, billingAddress: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          CUI facturare
        </label>
        <input
          type="text"
          value={formData.billingCui}
          onChange={(e) =>
            setFormData({ ...formData, billingCui: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? 'Se procesează...' : 'Continuă la plată'}
      </button>
    </form>
  );
};

export default OrderPage;

