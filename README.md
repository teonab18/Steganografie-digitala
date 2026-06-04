# Steganografie Digitală
### ```<Bulearcă Teona-Cristina>```
#


Aplicație web pentru securizarea datelor folosind tehnici de steganografie - ascunderea unor mesaje secrete în interiorul imaginilor (LSB) și criptografie (AES), dezvoltată în arhitectura Client-Server.

**Funcționalități cheie:**
* Ascunderea mesajelor în imagini (Steganografie LSB).
* Criptarea mesajelor înainte de ascundere (AES-256).
* Asistent virtual de securitate (integrare AI OpenRouter).
* Istoricul operațiunilor (Audit Log în MySQL).

### Instrucțiuni de rulare
Deoarece proiectul este complex (Full-Stack), rulați modulele în ordinea următoare:

**1. Baza de Date**
* Porniți MySQL (via XAMPP).
* Creați o bază de date numită: `stegano_db`.

**2. Backend (Server Java)**
* Deschideți folderul `backend`.
* Rulați aplicația `SteganoApplication.java` (Serverul va porni pe portul 8080).

**3. Frontend (Interfață React)**
* Deschideți un terminal în folderul `interfata-stegano`.
* Instalați pachetele și porniți interfața:
  ```bash
  npm install
  npm run dev

### Resurse de Testare
Pentru verificarea funcționalității, proiectul include un set de imagini de test.
* **Folder:** `poze test/`
