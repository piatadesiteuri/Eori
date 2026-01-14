import { Router, Request, Response } from 'express';

const router = Router();

// ANAF API endpoint pentru căutare CUI
// Endpoint oficial: https://webservicesp.anaf.ro/api/PlatitorTvaRest/v9/tva
// Documentație: https://mfinante.gov.ro/ro/web/etransport/informatii-tehnice
const ANAF_API_URL = 'https://webservicesp.anaf.ro/api/PlatitorTvaRest/v9/tva';

interface AnafResponse {
  cod: number;
  message: string;
  found?: Array<{
    date_generale: {
      cui: number;
      denumire: string;
      adresa: string;
      numar_reg_com: string;
      telefon: string;
      fax: string;
      codPostal: string;
      act: string;
      stare_inregistrare: string;
      data_inregistrare: string;
      data_actualizare: string;
      data_radiere: string;
      data_reactivare: string;
      data_inceput_ScopTva: string;
      data_sfarsit_ScopTva: string;
      mesaj: string;
    };
    stare_inregistrare?: {
      stare: string;
    };
  }>;
  notFound?: any[];
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { cui } = req.body;

    if (!cui || !/^\d+$/.test(cui)) {
      return res.status(400).json({ 
        success: false,
        error: 'CUI invalid. Te rugăm să introduci un CUI valid format doar din cifre.' 
      });
    }

    // Apelăm API-ul ANAF
    let response;
    try {
      // ANAF cere CUI-ul ca număr (integer) conform documentației
      // Format: [{"cui": 12345678, "data": "YYYY-MM-DD"}]
      const requestData = [
        {
          cui: parseInt(cui, 10), // Convertim la număr
          data: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
        },
      ];

      console.log('ANAF API Request:', JSON.stringify(requestData, null, 2));
      console.log('ANAF API URL:', ANAF_API_URL);

      // Folosim fetch în loc de axios pentru compatibilitate mai bună cu ANAF
      const fetchResponse = await fetch(ANAF_API_URL, {
        method: 'POST', // OBLIGATORIU POST
        headers: {
          'Content-Type': 'application/json', // OBLIGATORIU
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Origin': 'https://www.anaf.ro',
          'Referer': 'https://www.anaf.ro/',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(requestData),
      });

      console.log('ANAF API Response Status:', fetchResponse.status);
      console.log('ANAF API Response Headers:', Object.fromEntries(fetchResponse.headers.entries()));

      const contentType = fetchResponse.headers.get('content-type');
      console.log('ANAF API Content-Type:', contentType);

      if (contentType && contentType.includes('text/html')) {
        const text = await fetchResponse.text();
        console.error('ANAF API returned HTML error page:', text.substring(0, 200));
        return res.status(404).json({ 
          success: false,
          error: 'API-ul ANAF nu este disponibil momentan sau endpoint-ul a fost schimbat. Te rugăm să contactați suportul ANAF sau să încercați mai târziu.',
          details: 'Endpoint-ul returnează pagină HTML de eroare (probabil URL greșit sau mentenanță).'
        });
      }

      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        console.error('ANAF API Error Response:', errorText.substring(0, 200));
        return res.status(fetchResponse.status).json({
          success: false,
          error: `Eroare HTTP ${fetchResponse.status} de la ANAF`,
          details: errorText.substring(0, 200),
        });
      }

      const responseData = await fetchResponse.json();
      console.log('ANAF API Response Data:', JSON.stringify(responseData, null, 2).substring(0, 1000));

      // Creează un obiect similar cu axios response pentru compatibilitate
      response = {
        status: fetchResponse.status,
        data: responseData,
      } as any;

    } catch (fetchError: any) {
      console.error('ANAF API Error:', {
        message: fetchError.message,
        stack: fetchError.stack,
      });

      // Gestionează erorile de la ANAF API
      if (fetchError.message && fetchError.message.includes('fetch')) {
        return res.status(503).json({
          success: false,
          error: 'Serviciul ANAF nu este disponibil momentan. Te rugăm să încerci din nou mai târziu.',
          details: 'Eroare de conectare la serverul ANAF.',
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Eroare la căutarea firmei. Te rugăm să încerci din nou.',
        message: fetchError.message,
      });
    }

    // Verifică dacă răspunsul este valid
    if (!response || !response.data) {
      console.error('ANAF API returned no data');
      return res.status(404).json({ 
        success: false,
        error: 'CUI-ul introdus nu a fost găsit în baza de date ANAF. Te rugăm să verifici și să încerci din nou.' 
      });
    }

    // ANAF returnează date în structura: { found: [{ date_generale: {...}, stare_inregistrare: {...} }] }
    let companyData = null;
    
    // Verifică structura corectă a răspunsului ANAF
    if (response.data.found && response.data.found.length > 0) {
      const foundItem = response.data.found[0];
      if (foundItem.date_generale) {
        companyData = foundItem.date_generale;
      }
    }
    // Fallback pentru alte formate (dacă există)
    else if (response.data.date_generale && response.data.date_generale.length > 0) {
      companyData = response.data.date_generale[0];
    }
    // Verifică dacă răspunsul este direct un array
    else if (Array.isArray(response.data) && response.data.length > 0) {
      const firstItem = response.data[0];
      if (firstItem.found && firstItem.found.length > 0) {
        companyData = firstItem.found[0].date_generale;
      } else if (firstItem.date_generale) {
        companyData = firstItem.date_generale;
      }
    }

    if (!companyData) {
      console.error('ANAF API returned empty or invalid data structure');
      console.error('Response structure:', JSON.stringify(response.data, null, 2).substring(0, 1000));
      
      // Verifică dacă există mesaj de eroare în răspuns
      if (response.data.message) {
        return res.status(404).json({ 
          success: false,
          error: response.data.message || 'CUI-ul introdus nu a fost găsit în baza de date ANAF. Te rugăm să verifici și să încerci din nou.' 
        });
      }
      
      return res.status(404).json({ 
        success: false,
        error: 'CUI-ul introdus nu a fost găsit în baza de date ANAF. Te rugăm să verifici și să încerci din nou.' 
      });
    }

    console.log('Extracted company data:', JSON.stringify(companyData, null, 2));

    // Verifică mesajul de la ANAF - doar dacă este un mesaj clar de eroare
    if (companyData.mesaj) {
      const mesajLower = companyData.mesaj.toLowerCase();
      // Verifică doar mesaje clare de eroare
      if (mesajLower.includes('nu a fost gasit') || 
          mesajLower.includes('nu exista') ||
          (mesajLower.includes('invalid') && !companyData.denumire)) {
        console.error('ANAF returned error message:', companyData.mesaj);
        return res.status(404).json({ 
          success: false,
          error: 'CUI-ul introdus nu a fost găsit în baza de date ANAF. Te rugăm să verifici și să încerci din nou.' 
        });
      }
    }

    // Verifică dacă firma are cel puțin CUI-ul (denumirea poate lipsi în unele cazuri)
    if (!companyData.cui || (typeof companyData.cui === 'number' && companyData.cui === 0) || 
        (typeof companyData.cui === 'string' && companyData.cui.trim() === '')) {
      console.error('Company data missing CUI');
      return res.status(404).json({ 
        success: false,
        error: 'Datele firmei nu sunt complete în baza de date ANAF.' 
      });
    }

    // Returnează datele firmei (denumirea poate fi goală în unele cazuri, dar CUI-ul este obligatoriu)
    const cuiString = typeof companyData.cui === 'number' ? String(companyData.cui) : companyData.cui;
    
    // ANAF returnează nrRegCom (nu numar_reg_com)
    const registrationNumber = (companyData as any).nrRegCom?.trim() || 
                              companyData.numar_reg_com?.trim() || '';
    
    const result = {
      success: true,
      data: {
        cui: cuiString.trim(),
        name: companyData.denumire?.trim() || `Firma cu CUI ${cuiString.trim()}`,
        address: companyData.adresa?.trim() || '',
        registrationNumber: registrationNumber,
        phone: companyData.telefon?.trim() || '',
        postalCode: companyData.codPostal?.trim() || '',
        status: companyData.stare_inregistrare?.trim() || '',
      },
    };

    console.log('Returning company data:', JSON.stringify(result, null, 2));
    res.json(result);
  } catch (error: any) {
    console.error('Error searching company:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare neașteptată la căutarea firmei. Te rugăm să încerci din nou.',
      message: error.message,
    });
  }
});

export { router as searchCompany };
