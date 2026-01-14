import { useState, useEffect } from 'react';
import { XMarkIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, BuildingOfficeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal = ({ isOpen, onClose }: ContactModalProps) => {
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Așteptăm ca animația de deschidere să se termine (300ms) înainte de a încărca harta
      const timer = setTimeout(() => {
        setShouldLoadMap(true);
      }, 350); // 350ms pentru a fi sigur că animația s-a terminat
      
      return () => clearTimeout(timer);
    } else {
      // Resetăm când modalul se închide
      setShouldLoadMap(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsModalClosing(true);
    setShouldLoadMap(false); // Oprim încărcarea hărții când se închide
    setTimeout(() => {
      setIsModalClosing(false);
      onClose();
    }, 300);
  };

  if (!isOpen && !isModalClosing) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      style={{
        opacity: isModalClosing ? 0 : 1,
        transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isModalClosing) {
          handleClose();
        }
      }}
    >
      {/* Modal Content with Animation */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200"
        style={{
          transform: isModalClosing ? 'scale(0.75)' : undefined,
          opacity: isModalClosing ? 0 : undefined,
          transformOrigin: 'center center',
          transition: isModalClosing
            ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            : undefined,
          animation: !isModalClosing && isOpen ? 'zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Contact</h2>
            <button
              onClick={handleClose}
              className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all duration-200 hover:scale-110"
              aria-label="Închide"
            >
              <XMarkIcon className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Contact Info */}
            <div className="space-y-5">
              <div className="flex items-start space-x-3">
                <BuildingOfficeIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Firmă</h3>
                  <p className="text-gray-700">OPENCODE SRL</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <DocumentTextIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">CUI / CIF</h3>
                  <p className="text-gray-700">RO32332105</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <DocumentTextIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Nr. Reg. Com.</h3>
                  <p className="text-gray-700">J40/12446/2013</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPinIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Adresă</h3>
                  <p className="text-gray-700">Bulevardul Gheorghe Chițu 45</p>
                  <p className="text-gray-700">Craiova</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <PhoneIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Telefon</h3>
                  <a href="tel:0750445677" className="text-primary-600 hover:text-primary-700 transition-colors font-medium">
                    0750.445.677
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <a
                    href="mailto:info@beneficiar-app.ro"
                    className="text-primary-600 hover:text-primary-700 underline transition-colors font-medium"
                  >
                    info@beneficiar-app.ro
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column - OpenStreetMap */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPinIcon className="w-5 h-5 text-primary-600 mr-2" />
                  Locație
                </h3>
                <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white relative">
                  {/* Loading Placeholder - Elegant Skeleton */}
                  {!shouldLoadMap && (
                    <div className="w-full h-[300px] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                      {/* Animated background pattern */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0" style={{
                          backgroundImage: `
                            linear-gradient(45deg, transparent 30%, rgba(139, 92, 246, 0.1) 50%, transparent 70%),
                            linear-gradient(-45deg, transparent 30%, rgba(139, 92, 246, 0.1) 50%, transparent 70%)
                          `,
                          backgroundSize: '40px 40px'
                        }}></div>
                      </div>
                      {/* Center content */}
                      <div className="relative z-10 text-center">
                        <div className="relative inline-block mb-3">
                          <MapPinIcon className="w-10 h-10 text-primary-500 mx-auto animate-pulse" />
                          <div className="absolute inset-0 bg-primary-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-300 rounded w-32 mx-auto animate-pulse"></div>
                          <div className="h-2 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Interactive OpenStreetMap - se încarcă doar după animație */}
                  {shouldLoadMap && (
                    <iframe
                      src="https://www.openstreetmap.org/export/embed.html?bbox=23.790%2C44.315%2C23.800%2C44.325&layer=mapnik&marker=44.32%2C23.795"
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      title="Locație OPENCODE SRL - Bulevardul Gheorghe Chițu 45, Craiova"
                      className="w-full transition-opacity duration-300"
                    />
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <a 
                    href="https://www.openstreetmap.org/search?query=Bulevardul%20Gheorghe%20Chițu%2045%2C%20Craiova"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-600 hover:text-primary-700 underline"
                  >
                    Deschide harta mărită →
                  </a>
                  <p className="text-xs text-gray-400">
                    OpenStreetMap
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Închide
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;

