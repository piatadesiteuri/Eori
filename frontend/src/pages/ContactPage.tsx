const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">Contact</h1>
        
        <div className="card">
          <h2 className="text-2xl font-semibold mb-6">Informații de contact</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Email</h3>
              <p className="text-gray-600">info@beneficiar-app.ro</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Telefon</h3>
              <p className="text-gray-600">+40 XXX XXX XXX</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Adresă</h3>
              <p className="text-gray-600">
                București, România
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

