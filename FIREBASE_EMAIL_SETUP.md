# Firebase Trigger Email Setup for Offly

## Overview
Offly uses Firebase's Trigger Email extension to automatically send booking confirmation emails with ICS calendar attachments.

## Setup Instructions

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 2. Install Trigger Email Extension
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Extensions** → **Browse** → Search for "Trigger Email"
4. Click **Install**

### 3. Configure the Extension
Choose one of these email delivery methods:

#### Option A: Gmail SMTP (Recommended for testing)
- **SMTP connection URI**: `smtps://your-gmail@gmail.com:your-app-password@smtp.gmail.com:465`
- **Default FROM**: `your-gmail@gmail.com`
- **Default REPLY-TO**: `your-gmail@gmail.com`

**Important**: For Gmail, you need an "App Password":
1. Go to Google Account settings
2. Security → 2-Step Verification → App passwords
3. Generate password for "Mail"
4. Use this password (not your regular password)

#### Option B: SendGrid
- **SMTP connection URI**: `smtps://apikey:YOUR_SENDGRID_API_KEY@smtp.sendgrid.net:465`
- **Default FROM**: `noreply@yourdomain.com`
- **Default REPLY-TO**: `noreply@yourdomain.com`

### 4. Extension Configuration
Set these parameters:
- **Email documents collection**: `mail` (default)
- **Templates collection**: `mailTemplates` (optional)
- **Default FROM**: Your email address
- **Default REPLY-TO**: Your email address

### 5. Test the Extension
After installation, test by creating a document in Firestore:

```javascript
// In Firebase Console → Firestore → Create document in "mail" collection
{
  to: "test@example.com",
  message: {
    subject: "Test Email",
    html: "<h1>Hello World!</h1>",
    attachments: [{
      filename: "test.ics",
      content: "BASE64_ENCODED_ICS_CONTENT",
      type: "text/calendar"
    }]
  }
}
```

## How It Works

1. User books an event in the app
2. Booking is saved to Firestore
3. App creates a document in the `mail` collection
4. Firebase Trigger Email extension detects the document
5. Extension sends the email with ICS attachment
6. Document is automatically deleted after sending

## Email Template Structure

The app generates emails with this structure:

```javascript
{
  to: user.email,
  message: {
    subject: "✅ Prenotazione confermata: Event Title",
    html: "<div>HTML content with event details</div>",
    attachments: [{
      filename: "event.ics",
      content: base64EncodedICS,
      type: "text/calendar"
    }]
  }
}
```

## Troubleshooting

### Email not sending?
1. Check Firebase Console → Extensions → Trigger Email logs
2. Verify SMTP credentials are correct
3. Check Firestore security rules allow writes to `mail` collection

### ICS file not working?
1. Ensure content is properly base64 encoded
2. Check that `type: "text/calendar"` is set
3. Test ICS content with an online validator

### Security Rules
Add this to your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to create mail documents
    match /mail/{document} {
      allow create: if request.auth != null;
    }
  }
}
```

## Cost
- Firebase Extensions: Free tier available
- Email delivery: Depends on your SMTP provider (Gmail free, SendGrid paid for high volume)