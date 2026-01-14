import PaymentLogos from './PaymentLogos';

const Footer = () => {
  return (
    <footer className="bg-darkBlue-950 text-white mt-auto">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">Legislatie</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  Politica de confidențialitate
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  Politica de livrare/returnare
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  Termeni și condiții
                </a>
              </li>
              <li>
                <a
                  href="https://www.onrc.ro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-orange-400 transition-colors"
                >
                  www.ONRC.ro
                </a>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="font-semibold mb-4">Plăți acceptate</h3>
            <div className="mb-4">
              <PaymentLogos />
            </div>
          </div>

          {/* Company Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>OPENCODE SRL</li>
              <li>RO32332105</li>
              <li>J40/12446/2013</li>
              <li>Romulus 38</li>
              <li>Sector 3, București</li>
              <li>0750.445.677</li>
              <li>
                <a href="mailto:info@eori-cod.ro" className="hover:text-orange-400 transition-colors">
                  info@eori-cod.ro
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-darkBlue-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2024 eori-cod.ro - toate drepturile rezervate</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

