# 🌿 Offly — Offline Club

> *Ritroviamoci dal vivo.*

**Offly** è la web app dell'**Offline Club del Palizzi-Mattei**: un luogo digitale il cui unico scopo è quello di far incontrare le persone nel mondo reale. Scopri gli eventi, prenota il tuo posto, e poi — metti giù il telefono.

🔗 **[offly-mu.vercel.app](https://offly-mu.vercel.app)**

---

## 🏆 Premio Mattia Di Iorio

Offly è il progetto vincitore del **Premio "Mattia Di Iorio"**, il concorso STEAM istituito dall'**IIS Palizzi-Mattei di Vasto** in memoria di Mattia Di Iorio, studente del Liceo delle Scienze Applicate scomparso prematuramente a 16 anni il 9 giugno 2025.

Mattia era un ragazzo curioso, appassionato della vita, che si indignava vedendo i suoi coetanei con gli occhi fissi sullo schermo:

> *"Io lo so che la mia vita sarà più breve di quella degli altri — diceva — e quando Dio deciderà di riprendermi non avrò paura, ma nel frattempo la voglio vivere al meglio."*

Il concorso, promosso e finanziato dalla sua famiglia e coordinato dalla professoressa Laura Oliva, ha chiesto agli studenti di progettare il **Club Offline Palizzi-Mattei**: un'iniziativa concreta per rimettere al centro le relazioni umane, gli incontri di persona, la condivisione autentica. Il tema richiedeva di definire identità, regolamento, calendario attività e — appunto — una web app per organizzare e gestire il club.

La cerimonia finale si è svolta il **22 maggio 2026** presso la scuola.

---

## 💡 L'idea

In un'epoca in cui ogni interazione sembra passare da uno schermo, l'Offline Club è un atto di resistenza gentile: un gruppo di persone che sceglie consapevolmente di trovarsi di persona, senza il filtro del digitale.

Offly è lo strumento che rende possibile tutto questo — un'app che usa la tecnologia per organizzare momenti in cui la tecnologia non c'è. Paradossale e necessario.

---

## Cosa fa Offly

L'app è pensata per i membri del club e per chi vuole unirsi. In poche schermate permette di:

**Scoprire gli eventi** — la homepage mostra gli incontri in programma: dove, quando, di cosa si tratta. Niente algoritmi, niente feed infiniti. Solo quello che conta.

**Prenotare un posto** — con un click, l'utente riserva il suo spazio all'evento. La prenotazione è semplice e immediata.

**Ricevere la conferma via email** — dopo la prenotazione arriva un'email con tutti i dettagli e un file `.ics` allegato, pronto per essere aggiunto al proprio calendario (Google Calendar, Apple Calendar, Outlook — funziona ovunque).

**Integrare Google Calendar** — chi lo vuole può collegare il proprio account Google e sincronizzare automaticamente gli eventi del club.

Dietro le quinte, gli organizzatori gestiscono tutto da un **pannello admin** dedicato: creano eventi, monitorano le prenotazioni, tengono in ordine il calendario del club.

---

## 🛠️ Come è costruita

Offly è una web app moderna, pensata per funzionare bene su qualsiasi dispositivo.

Il frontend è costruito con **Next.js** e **TypeScript**, stilizzato con **Tailwind CSS** e animato con **Framer Motion** per un'esperienza fluida e piacevole. Il backend si appoggia interamente su **Firebase**: Firestore come database, Firebase Authentication per la gestione degli utenti e degli admin, e l'estensione **Trigger Email** per l'invio automatico delle email di conferma. L'integrazione calendario sfrutta le **Google Calendar API** via OAuth 2.0. Il tutto è deployato su **Vercel**.

```
Next.js 16 + TypeScript
Tailwind CSS 4 + Framer Motion
Firebase (Firestore + Auth + Trigger Email)
Google Calendar API
Vercel
```

---

## 📁 Struttura del progetto

```
offly/
├── public/                  # Asset statici
├── scripts/
│   └── setup-admin.js       # Crea l'utente admin su Firebase
├── src/
│   └── app/                 # Next.js App Router
│       ├── page.tsx          # Homepage — lista eventi
│       ├── layout.tsx        # Layout globale
│       └── admin/login/     # Pannello admin
├── FIREBASE_EMAIL_SETUP.md  # Guida alla configurazione email
├── next.config.ts
└── package.json
```

---

## ⚙️ Configurazione rapida (per sviluppatori)

Crea un file `.env.local` con queste variabili:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Google Calendar
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Admin (email separate da virgola)
NEXT_PUBLIC_ADMIN_EMAILS=
```

Poi:

```bash
npm install
npm run dev
```

Per creare l'utente admin: `node scripts/setup-admin.js`, poi accedi su `/admin/login`.

Per la configurazione dell'estensione email di Firebase (incluse le istruzioni per Gmail SMTP e SendGrid), consulta [`FIREBASE_EMAIL_SETUP.md`](./FIREBASE_EMAIL_SETUP.md).

---

## In memoria di Mattia

Questo progetto esiste perché Mattia credeva che stare insieme — davvero, di persona — fosse una delle cose più preziose che esistano. Offly prova a renderlo un po' più facile.

> *"A Mattia posso soltanto continuare a dire grazie perché era un ragazzo brillante, curioso, sempre pronto a porsi domande e a cercare soluzioni, con la voglia autentica di capire e di costruire."*
> — Prof.ssa Laura Oliva, referente del progetto
