# Diferența între cheile Netopia

## Există DOUĂ tipuri de chei diferite:

### 1. API Key (pe care o ai deja ✅)
- **Ce este:** Cheie pentru autentificare API REST
- **Unde o găsești:** Dashboard Netopia → API → API Key
- **Format:** String text (ex: `bb0cyXogcUfBeTldkASF00Kjay7cMAJD9KAF0NP0M8cxfGGuqVJpoR9sgefm`)
- **Unde o folosești:** În `.env` ca `NETOPIA_API_KEY`
- **Status:** ✅ Ai deja această cheie

### 2. Cheia publică RSA (LIPSEȘTE ❌)
- **Ce este:** Cheie criptografică pentru criptarea datelor XML
- **Unde o găsești:** Dashboard Netopia → **Securitate** → **Chei de criptare** → **Cheia publică**
- **Format:** Fișier `.cer` sau `.pem` (conține cheia RSA)
- **Unde o folosești:** Fișier în `backend/src/keys/netopia-public.cer`
- **Status:** ❌ Lipsește - trebuie descărcată

## De ce ai nevoie de ambele?

### API Key
- Folosită pentru autentificare când folosești API REST v2
- Nu este suficientă pentru metoda XML criptată

### Cheia publică RSA
- Folosită pentru a cripta datele XML înainte de trimitere
- Netopia folosește cheia privată corespunzătoare pentru decriptare
- **OBLIGATORIE** pentru metoda oficială Netopia (XML criptat)

## Cum să găsești cheia publică RSA în Netopia:

### Opțiunea 1: Dashboard Netopia
1. Loghează-te în: https://sandbox.netopia-payments.com
2. Mergi la: **Securitate** → **Chei de criptare**
3. Caută: **Cheia publică** sau **Public Key**
4. Descarcă fișierul `.cer` sau `.pem`

### Opțiunea 2: Setări API
1. Dashboard → **Setări** → **API**
2. Caută secțiunea **Chei de criptare**
3. Descarcă cheia publică

### Opțiunea 3: Generare nouă (dacă nu o găsești)
1. Dashboard → **Securitate** → **Chei de criptare**
2. Click pe **Generează chei noi** sau **Generate Keys**
3. Descarcă cheia publică generată

## Unde plasezi cheia publică:

După ce descarci cheia publică:

```bash
# Copiază fișierul în:
/Users/PDS/Desktop/Beneficiar-App/backend/src/keys/netopia-public.cer
```

Sau setează calea în `.env`:
```env
NETOPIA_PUBLIC_KEY_PATH=/calea/completa/catre/netopia-public.cer
```

## Verificare

După ce plasezi cheia, verifică:
```bash
ls -la backend/src/keys/netopia-public.cer
```

Ar trebui să vezi fișierul acolo.

## Important

- **API Key** ≠ **Cheia publică RSA**
- Ai nevoie de **AMBELE** pentru integrare completă
- Fără cheia publică RSA, aplicația rulează în modul test (simulare)
- Cu cheia publică RSA, aplicația folosește Netopia real

## Suport

Dacă nu găsești cheia publică în contul Netopia:
- Contactează suportul: support@netopia-payments.com
- Menționează că ai nevoie de "Public Key" sau "Cheia publică RSA" pentru criptare XML

