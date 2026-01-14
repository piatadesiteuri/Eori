import { useNavigate } from 'react-router-dom';

interface CompanyData {
  cui: string;
  name: string;
  address: string;
  registrationNumber: string;
  phone: string;
  postalCode: string;
  status: string;
}

interface PaymentFormProps {
  companyData: CompanyData | null;
  documentType: string;
  documentPurpose?: string;
  extractType?: string;
  applicantType?: string; // Pentru EORI
  billingType?: 'company' | 'other_company' | 'individual';
  billingCui?: string;
  billingCompanyData?: CompanyData | null;
  billingFormData?: {
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
  onBack?: () => void;
}

const PaymentForm = ({
  companyData,
  documentType,
  documentPurpose,
  extractType,
  applicantType: _applicantType,
  billingType = 'company',
  billingCui = '',
  billingCompanyData = null,
  billingFormData = { firstName: '', lastName: '' },
  contactData,
  phoneCountryCode,
  onBack,
}: PaymentFormProps) => {
  const navigate = useNavigate();

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

  const amount = getDocumentPrice(documentType, extractType);

  const handlePayment = () => {
    console.log('Payment button clicked', {
      companyData,
      documentType,
      contactData,
      phoneCountryCode,
    });
    
    // Validare date necesare
    if (!companyData || !documentType || !contactData.email) {
      console.error('Missing required data for payment');
      alert('Date incomplete. Te rugăm să completezi toate câmpurile obligatorii.');
      return;
    }

    // Salvăm toate datele în sessionStorage pentru a le restaura când se întoarce
    const formDataToSave = {
      companyData,
      documentType,
      documentPurpose,
      extractType,
      billingType,
      billingCui,
      billingCompanyData,
      billingFormData,
      contactData,
      phoneCountryCode,
      step: 5, // Pasul curent
    };
    sessionStorage.setItem('homePageFormData', JSON.stringify(formDataToSave));
    console.log('Form data saved to sessionStorage:', formDataToSave);

    // Redirecționăm către pagina de plată cu toate datele necesare
    try {
      navigate('/plata', {
        state: {
          companyData,
          documentType,
          documentPurpose,
          extractType,
          billingType,
          billingCui,
          billingCompanyData,
          billingFormData,
          contactData,
          phoneCountryCode,
        },
      });
    } catch (error) {
      console.error('Navigation error:', error);
      alert('Eroare la navigare. Te rugăm să încerci din nou.');
    }
  };

  return (
    <div>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600 text-sm">Tip document:</span>
          <span className="font-semibold text-sm">
            {documentType === 'obtinere_eori' && 'Obținere cod EORI'}
            {documentType === 'modificare_eori' && 'Modificare cod EORI'}
            {documentType === 'certificat_beneficiar' && 'Certificat Constatat'}
            {documentType === 'furnizare_info' && 'Beneficiari Reali'}
            {documentType === 'certificat_istoric' && 'Constatator cu Istoric'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm">Total:</span>
          <span className="text-xl font-bold text-primary-600">{amount} lei</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            ← Înapoi
          </button>
        )}
        <button
          type="button"
          onClick={handlePayment}
          className={`${onBack ? 'flex-1' : 'w-full'} px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors`}
        >
          Plătește {amount} lei
        </button>
      </div>
    </div>
  );
};

export default PaymentForm;
