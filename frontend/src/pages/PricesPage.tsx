import { Link } from 'react-router-dom';

const PricesPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Prețuri</h1>
      
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="card hover:shadow-lg transition-shadow">
          <div className="text-center mb-6">
            <span className="text-4xl font-bold text-primary-600">88</span>
            <span className="text-gray-600 ml-1">lei</span>
            <p className="text-sm text-gray-500 mt-2">• Eliberare pe loc •</p>
          </div>
          <h3 className="font-semibold text-lg mb-4">Certificat Beneficiar Real</h3>
          <p className="text-sm text-gray-600 mb-6">
            Se eliberează în baza legii 265/2022 (abrogă 26/1990 și 359/2004).
            Se solicită în relația cu autorități sau instituții și este eliberat
            în formă detaliată / extinsă. Se eliberează pe CUI sau pe CNP.
          </p>
          <Link to="/comanda" className="btn-primary w-full text-center block">
            Comandă
          </Link>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="text-center mb-6">
            <span className="text-4xl font-bold text-primary-600">165</span>
            <span className="text-gray-600 ml-1">lei</span>
            <p className="text-sm text-gray-500 mt-2">• Eliberare pe loc •</p>
          </div>
          <h3 className="font-semibold text-lg mb-4">
            Furnizare Informații Beneficiari Reali
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Audit și furnizare informații privind Beneficiarii Reali. Audit
            al extrasului oficial din Registru cu privire la respectarea
            prevederilor Legii 129/2019. Se auditează Situație la zi sau
            Raport istoric. Se eliberează pe CUI sau pe CNP.
          </p>
          <Link to="/comanda" className="btn-primary w-full text-center block">
            Comandă
          </Link>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="text-center mb-6">
            <span className="text-4xl font-bold text-primary-600">399</span>
            <span className="text-gray-600 ml-1">lei</span>
            <p className="text-sm text-gray-500 mt-2">• Eliberare pe loc •</p>
          </div>
          <h3 className="font-semibold text-lg mb-4">
            Certificat Beneficiar Real cu Istoric
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Raport Istoric ONRC. Cuprinde informații despre toate
            înregistrările făcute în Registrul Comerțului în dreptul unei
            firme, prezentate în ordine cronologică și completate cu
            situația la zi. Se eliberează doar pe CUI.
          </p>
          <Link to="/comanda" className="btn-primary w-full text-center block">
            Comandă
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PricesPage;

