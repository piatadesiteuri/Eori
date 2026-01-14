import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface PaymentDetails {
  id: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  status: string;
  createdAt: string;
}

interface OrderDetails {
  id: number;
  companyName: string;
  documentType: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  createdAt: string;
}

interface PaymentStatusResponse {
  success: boolean;
  orderId: number;
  netopiaOrderId: string;
  status: string;
  paymentIntentId: string;
  order: OrderDetails;
  payment: PaymentDetails | null;
  amount: number;
  currency: string;
}

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<PaymentStatusResponse | null>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const orderIdParam = searchParams.get('orderId');
      const status = searchParams.get('status');
      const testMode = searchParams.get('test') === 'true';

      if (!orderIdParam) {
        setError('Parametru orderId lipsă');
        setLoading(false);
        return;
      }

      setOrderId(orderIdParam);

      // IMPORTANT: Verificăm întotdeauna statusul comenzii din baza de date,
      // indiferent de parametrii URL, pentru că Netopia poate să nu trimită status în URL
      // dar webhook-ul poate să fi actualizat deja statusul în baza de date
      try {
        // Verificăm statusul comenzii (poate fi ID numeric sau netopiaOrderId string)
        const response = await axios.get<PaymentStatusResponse>(`/api/payment/netopia/status/${orderIdParam}`);
        
        console.log('Payment status check response:', response.data);
        
        // Salvăm detaliile plății
        setPaymentDetails(response.data);
        
        if (response.data.success && response.data.status === 'paid') {
          setSuccess(true);
          setError('');
          
          // Generăm certificatul dacă nu a fost generat deja
          try {
            await axios.post(`/api/certificate/generate/${response.data.orderId}`);
          } catch (err) {
            console.error('Error generating certificate:', err);
            // Nu afișăm eroare dacă certificatul a fost deja generat
          }
        } else if (response.data.success && response.data.status === 'pending') {
          // Dacă plata este încă pending, încercăm să o confirmăm manual (pentru testare când webhook-ul nu funcționează)
          // Reîncercăm după 3 secunde (maxim 5 încercări = 15 secunde)
          const retryCount = parseInt(sessionStorage.getItem('paymentRetryCount') || '0');
          
          if (retryCount < 5) {
            setError('Plata este în curs de procesare. Vă rugăm să așteptați...');
            sessionStorage.setItem('paymentRetryCount', (retryCount + 1).toString());
            setTimeout(() => {
              checkPaymentStatus();
            }, 3000);
          } else {
            // După 5 încercări, încercăm să confirmăm manual (pentru testare)
            // În producție, webhook-ul ar trebui să funcționeze
            console.log('⚠️ Payment still pending after 5 retries, attempting manual confirm (for testing)');
            try {
              const manualConfirmResponse = await axios.post(`/api/payment/netopia/manual-confirm/${orderIdParam}`);
              if (manualConfirmResponse.data.success) {
                // Reîncărcăm statusul
                setTimeout(() => {
                  checkPaymentStatus();
                }, 1000);
              } else {
                setError('Plata este încă în procesare. Vă rugăm să verificați în Netopia Dashboard sau să contactați suportul.');
                setLoading(false);
              }
            } catch (manualErr: any) {
              console.error('Manual confirm failed:', manualErr);
              setError('Plata este încă în procesare. Vă rugăm să verificați în Netopia Dashboard sau să contactați suportul.');
              setLoading(false);
            }
          }
        } else {
          // Dacă statusul este 'failed' sau altceva
          setError('Plata nu a fost finalizată cu succes. Status: ' + (response.data.status || 'necunoscut'));
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error checking payment status:', err);
        // Dacă nu găsim comanda sau altă eroare, verificăm dacă este test mode
        if (testMode && status === 'success') {
          setSuccess(true);
          setError('');
        } else {
          setError(err.response?.data?.error || err.response?.data?.message || 'Eroare la verificarea statusului plății');
        }
        setLoading(false);
      }
    };

    // Resetăm counter-ul la început
    sessionStorage.removeItem('paymentRetryCount');
    checkPaymentStatus();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-12 text-center border border-gray-200">
          <div className="w-16 h-16 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-700 font-medium text-lg">Se verifică statusul plății...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-10 text-center border border-gray-200">
        {success ? (
          <>
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-primary-200">
              <CheckCircleIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900">
              Plată finalizată cu succes
            </h2>
            <p className="text-gray-600 mb-8 text-base">Comanda a fost procesată cu succes</p>
            
            {/* Detalii tranzacție */}
            {paymentDetails && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-5 text-base flex items-center">
                  <span className="w-0.5 h-5 bg-primary-600 mr-3"></span>
                  Detalii tranzacție
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID Comandă:</span>
                    <span className="font-medium text-gray-900">#{paymentDetails.orderId}</span>
                  </div>
                  {paymentDetails.netopiaOrderId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID Netopia:</span>
                      <span className="font-medium text-gray-900">{paymentDetails.netopiaOrderId}</span>
                    </div>
                  )}
                  {paymentDetails.order.companyName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Firmă:</span>
                      <span className="font-medium text-gray-900">{paymentDetails.order.companyName}</span>
                    </div>
                  )}
                  {(paymentDetails.order.firstName || paymentDetails.order.lastName) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Client:</span>
                      <span className="font-medium text-gray-900">
                        {paymentDetails.order.firstName || ''} {paymentDetails.order.lastName || ''}
                      </span>
                    </div>
                  )}
                  {paymentDetails.order.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">{paymentDetails.order.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-4 mt-4 border-t border-gray-300">
                    <span className="text-gray-700 font-semibold text-base">Sumă:</span>
                    <span className="font-bold text-primary-600 text-lg">
                      {paymentDetails.amount.toFixed(2)} {paymentDetails.currency}
                    </span>
                  </div>
                  {paymentDetails.payment && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Metodă plată:</span>
                        <span className="font-medium text-gray-900 capitalize">
                          {paymentDetails.payment.paymentMethod === 'netopia_card' ? 'Card' : paymentDetails.payment.paymentMethod}
                        </span>
                      </div>
                      {paymentDetails.payment.transactionId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">ID Tranzacție:</span>
                          <span className="font-medium text-gray-900 text-xs">{paymentDetails.payment.transactionId}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            
            <p className="text-gray-600 mb-8 text-base leading-relaxed">
              Certificatul va fi generat și trimis pe email în câteva minute.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Înapoi la pagina principală
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-gray-300">
              <XCircleIcon className="w-8 h-8 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900">
              Eroare la procesarea plății
            </h2>
            <p className="text-gray-600 mb-8 text-base leading-relaxed">
              {error || 'Plata nu a putut fi procesată. Vă rugăm să încercați din nou.'}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/plata')}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                Încearcă din nou
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-8 rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                Înapoi la pagina principală
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

