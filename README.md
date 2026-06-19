# Event Registration System

A simple student registration + organizer QR scanner for event management.

## Features
- **Student Registration**: Register with name and email, receive QR code by email
- **Organizer Scanner**: Login and scan QR codes to verify attendees

## Setup

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure environment variables
Create a `.env` file in the project root with:
```
GMAIL_EMAIL=your-email@gmail.com
GMAIL_PASSWORD=your-app-password
ORGANIZER_USERNAME=organizer
ORGANIZER_PASSWORD=eventpass
```

**For Gmail:**
- Enable 2-factor authentication on your Google account
- Generate an [App Password](https://support.google.com/accounts/answer/185833)
- Use the app password (not your account password)

### 3. Run the app
```bash
python app.py
```

The app will start at `http://localhost:5000`

## Usage

### Student Flow
1. Go to the homepage
2. Enter name and email
3. Click "Register"
4. Check your email for the QR code (check spam folder)

### Organizer Flow
1. Click "Organizer" tab
2. Login with: `organizer` / `eventpass`
3. Click "Scan" to read QR codes from camera

## Deployment

For production deployment:
1. Set environment variables on your hosting platform (PythonAnywhere, Render, Heroku, etc.)
2. Never commit `.env` files to version control
3. Update `app.py` to set `debug=False` for production
