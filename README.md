# MedCare – My Personal Health Organizer

A React + Vite prototype that combines a personal health organizer with a medicine
reminder and doctor appointment manager.

## Features
- Dashboard with medicine count, appointment count, doses taken today and today's schedule
- Medicines: add, view, mark as taken (undo), send manual reminder, delete
- Appointments: save, view (sorted by date/time), delete
- Health Organizer page (daily schedule, doctor appointments, emergency contacts, disclaimer)
- Data saved in browser LocalStorage (survives refresh)
- Browser Notifications API with permission request, manual reminders and automatic
  reminder checking every 30 seconds while the app is open
- State-based navigation (no React Router), responsive layout

## Requirements
- Node.js 18 or newer (https://nodejs.org)
- VS Code (recommended)

## Installation & Running

1. Open the `my-react-app` folder in VS Code.
2. Open the terminal (`Ctrl + ` `) and run:

```bash
npm install
npm run dev
```

3. Open the URL shown in the terminal (usually http://localhost:5173).

## Other Commands
```bash
npm run build     # create production build in dist/
npm run preview   # preview the production build
```

## Using Notifications
Click **Enable Notifications** on the top bar and allow the browser prompt.
Medicines will then show browser notifications at their reminder time while the app is open.
Reminders always also appear as on-screen alerts.

## Project Structure
```
my-react-app/
├── public/
├── src/
│   ├── assets/
│   ├── App.css        # component and page styles
│   ├── App.jsx        # all pages, components and app state
│   ├── index.css      # global styles and theme variables
│   └── main.jsx       # React entry point
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```
PPT link : https://docs.google.com/presentation/d/1H_1vGpBsnR-HG2RHr0Q1vFUTTMbTnzlJ/edit?usp=drivesdk&ouid=111019127888040027286&rtpof=true&sd=true
