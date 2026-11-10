import { useState, useEffect } from "react";
import "./App.css";
import appSource from "./App.jsx?raw";
import appCss from "./App.css?raw";
import indexCss from "./index.css?raw";
import mainSource from "./main.jsx?raw";

/* =========================================================
   SAMPLE DATA (starting values for the Health Organizer)
   ========================================================= */
const SAMPLE_ORGANIZER = {
  schedule: [
    { id: 1, label: "Morning (8:00 AM)", text: "Multivitamin - 1 Tablet" },
    { id: 2, label: "Afternoon (1:00 PM)", text: "Vitamin D3 - 1 Capsule" },
    { id: 3, label: "Evening (8:00 PM)", text: "Heart Health Supplement - 1 Pill" },
  ],
  contacts: [
    { id: 1, label: "Local Pharmacy", number: "555-0199" },
    { id: 2, label: "Primary Care Clinic", number: "555-0144" },
    { id: 3, label: "Trusted Family Member", number: "555-0100" },
  ],
};

/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

// Read saved data from LocalStorage
function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

// Today's date as YYYY-MM-DD (local time)
function getTodayString() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

// Current time as HH:MM (local, 24-hour)
function getCurrentTimeString() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Is the medicine scheduled for this date?
function isActiveOn(medicine, date) {
  return date >= medicine.startDate && date <= medicine.endDate;
}

// Has this appointment already passed?
function isPastAppointment(appointment, today, nowTime) {
  return appointment.date < today || (appointment.date === today && appointment.time < nowTime);
}

// Sort appointments by date, then time
function sortAppointments(a, b) {
  const dateCompare = a.date.localeCompare(b.date);
  return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
}

/* =========================================================
   HEADER & NAVIGATION
   ========================================================= */
const PAGES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "medicines", label: "Medicines" },
  { key: "addMedicine", label: "Add Medicine" },
  { key: "appointments", label: "Appointments" },
  { key: "organizer", label: "Health Organizer" },
  { key: "project", label: "Project Report" },
];

function Header({ currentPage, onNavigate }) {
  return (
    <header className="no-print">
      <div className="logo">💊 MedCare</div>
      <nav>
        {PAGES.map((page) => (
          <button
            key={page.key}
            className={currentPage === page.key ? "active" : ""}
            onClick={() => onNavigate(page.key)}
          >
            {page.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

/* =========================================================
   PAGE: DASHBOARD
   ========================================================= */
function DashboardPage({
  medicines,
  appointmentCount,
  takenDoses,
  today,
  nowTime,
  nextAppointment,
  todayMedicines,
  isTakenToday,
  onMarkTaken,
  onRemind,
}) {
  const todayCount = takenDoses.filter((key) => key.startsWith(today)).length;

  // Doses not taken yet today
  const pendingMedicines = todayMedicines.filter((m) => !isTakenToday(m.id));
  const overdueCount = pendingMedicines.filter((m) => m.time < nowTime).length;

  return (
    <section>
      <h1>Medicine Reminder &amp; Health Organizer</h1>

      <div className="cards">
        <div className="card">
          <h3>{medicines.length}</h3>
          <p>Total Medicines</p>
        </div>
        <div className="card">
          <h3>{appointmentCount}</h3>
          <p>Appointments</p>
        </div>
        <div className="card">
          <h3>{todayCount}</h3>
          <p>Doses Taken Today</p>
        </div>
      </div>

      <div className="summary-grid">
        <div className="panel">
          <h2>⏭ Next Appointment</h2>
          {nextAppointment ? (
            <>
              <p>
                <b>{nextAppointment.doctor}</b> at {nextAppointment.hospital || "clinic not specified"}
              </p>
              <p>📅 {nextAppointment.date} · ⏰ {nextAppointment.time}</p>
            </>
          ) : (
            <p>No upcoming appointments.</p>
          )}
        </div>

        <div className="panel">
          <h2>⚠️ Doses Pending Today</h2>
          <p>
            <b>{pendingMedicines.length}</b> pending
          </p>
          <p>
            <b>{overdueCount}</b> overdue (reminder time has passed)
          </p>
        </div>
      </div>

      <div className="panel">
        <h2>📅 Today's Medicine Schedule</h2>

        {medicines.length === 0 && <div className="empty">No medicines scheduled.</div>}
        {medicines.length > 0 && todayMedicines.length === 0 && (
          <div className="empty">No medicines scheduled for today.</div>
        )}

        {todayMedicines.map((medicine) => (
          <div className="medicine" key={medicine.id}>
            <div>
              <h3>{medicine.name}</h3>
              <p>{medicine.dosage}</p>
              <p>⏰ {medicine.time}</p>
            </div>

            <div className="actions">
              {isTakenToday(medicine.id) ? (
                <button className="taken" disabled>
                  ✓ Taken
                </button>
              ) : (
                <button className="taken no-print" onClick={() => onMarkTaken(medicine.id)}>
                  Mark Taken
                </button>
              )}
              <button className="reminder no-print" onClick={() => onRemind(medicine)}>
                🔔
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   PAGE: MEDICINES
   ========================================================= */
function MedicinesPage({ medicines, onRemind, onMarkTaken, onDelete }) {
  return (
    <section>
      <h1>💊 My Medicines</h1>

      <div className="panel">
        {medicines.length === 0 && <div className="empty">No medicines added yet.</div>}

        {medicines.map((medicine) => (
          <div className="medicine" key={medicine.id}>
            <div>
              <h3>💊 {medicine.name}</h3>
              <p>
                <b>Dosage:</b> {medicine.dosage}
              </p>
              <p>
                <b>Time:</b> {medicine.time}
              </p>
              <p>
                <b>Instructions:</b> {medicine.instructions || "None"}
              </p>
              <p>
                <b>Schedule:</b> {medicine.startDate} to {medicine.endDate}
              </p>
            </div>

            <div className="actions no-print">
              <button className="reminder" onClick={() => onRemind(medicine)}>
                🔔 Remind Me
              </button>
              <button className="taken" onClick={() => onMarkTaken(medicine.id)}>
                ✅ Taken
              </button>
              <button className="delete" onClick={() => onDelete(medicine.id)}>
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   PAGE: ADD MEDICINE (controlled form with validation)
   ========================================================= */
const EMPTY_MEDICINE = {
  name: "",
  dosage: "",
  instructions: "",
  time: "",
  startDate: "",
  endDate: "",
};

function AddMedicinePage({ onAddMedicine }) {
  const [form, setForm] = useState(EMPTY_MEDICINE);

  function handleChange(e) {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const saved = onAddMedicine({
      id: Date.now(),
      name: form.name.trim(),
      dosage: form.dosage.trim(),
      instructions: form.instructions.trim(),
      time: form.time,
      startDate: form.startDate,
      endDate: form.endDate,
    });
    if (saved) setForm(EMPTY_MEDICINE);
  }

  return (
    <section>
      <h1>➕ Add Medicine</h1>

      <div className="panel">
        <form onSubmit={handleSubmit}>
          <label>
            Medicine Name
            <input id="name" type="text" placeholder="Example: Paracetamol" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Dosage
            <input id="dosage" type="text" placeholder="Example: 1 tablet" value={form.dosage} onChange={handleChange} required />
          </label>

          <label>
            Instructions
            <input id="instructions" type="text" placeholder="Example: After food" value={form.instructions} onChange={handleChange} />
          </label>

          <label>
            Reminder Time
            <input id="time" type="time" value={form.time} onChange={handleChange} required />
          </label>

          <label>
            Start Date
            <input id="startDate" type="date" value={form.startDate} onChange={handleChange} required />
          </label>

          <label>
            End Date
            <input id="endDate" type="date" value={form.endDate} onChange={handleChange} required />
          </label>

          <button className="primary" type="submit">
            Save Medicine
          </button>
        </form>
      </div>
    </section>
  );
}

/* =========================================================
   PAGE: APPOINTMENTS (form, upcoming and past lists)
   ========================================================= */
const EMPTY_APPOINTMENT = {
  doctor: "",
  hospital: "",
  date: "",
  time: "",
  notes: "",
};

function AppointmentsPage({ appointments, today, nowTime, onAddAppointment, onDeleteAppointment }) {
  const [form, setForm] = useState(EMPTY_APPOINTMENT);

  function handleChange(e) {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const saved = onAddAppointment({
      id: Date.now(),
      doctor: form.doctor.trim(),
      hospital: form.hospital.trim(),
      date: form.date,
      time: form.time,
      notes: form.notes.trim(),
    });
    if (saved) setForm(EMPTY_APPOINTMENT);
  }

  const upcoming = appointments
    .filter((a) => !isPastAppointment(a, today, nowTime))
    .sort(sortAppointments);
  const past = appointments
    .filter((a) => isPastAppointment(a, today, nowTime))
    .sort(sortAppointments)
    .reverse();

  function renderAppointment(appointment, isPast) {
    return (
      <div className={`appointment ${isPast ? "past" : ""}`} key={appointment.id}>
        <div>
          <h3>👨‍⚕️ {appointment.doctor}</h3>
          <p>🏥 {appointment.hospital || "Not specified"}</p>
          <p>📅 {appointment.date}</p>
          <p>⏰ {appointment.time}</p>
          <p>📝 {appointment.notes || "No notes"}</p>
          {isPast && <p className="past-label">Past appointment</p>}
        </div>

        <button className="delete no-print" onClick={() => onDeleteAppointment(appointment.id)}>
          Delete
        </button>
      </div>
    );
  }

  return (
    <section>
      <h1>👨‍⚕️ Doctor Appointments</h1>

      <div className="panel">
        <h2>Add Appointment</h2>

        <form onSubmit={handleSubmit}>
          <label>
            Doctor Name
            <input id="doctor" type="text" placeholder="Example: Dr. Kumar" value={form.doctor} onChange={handleChange} required />
          </label>

          <label>
            Hospital / Clinic
            <input id="hospital" type="text" placeholder="Hospital name" value={form.hospital} onChange={handleChange} />
          </label>

          <label>
            Date
            <input id="date" type="date" min={today} value={form.date} onChange={handleChange} required />
          </label>

          <label>
            Time
            <input id="time" type="time" value={form.time} onChange={handleChange} required />
          </label>

          <label>
            Notes
            <textarea id="notes" placeholder="Appointment notes" value={form.notes} onChange={handleChange} />
          </label>

          <button className="primary" type="submit">
            Save Appointment
          </button>
        </form>
      </div>

      <div className="panel">
        <h2>📅 Upcoming Appointments</h2>
        {upcoming.length === 0 && <div className="empty">No upcoming appointments.</div>}
        {upcoming.map((a) => renderAppointment(a, false))}
      </div>

      {past.length > 0 && (
        <div className="panel">
          <h2>🗂 Past Appointments</h2>
          {past.map((a) => renderAppointment(a, true))}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   PAGE: HEALTH ORGANIZER (editable, print-friendly)
   ========================================================= */
function HealthOrganizerPage({
  organizer,
  upcomingAppointments,
  onAddScheduleItem,
  onDeleteScheduleItem,
  onAddContact,
  onDeleteContact,
  onRestoreSample,
  onClearAll,
  onGoToAppointments,
}) {
  const [scheduleForm, setScheduleForm] = useState({ label: "", text: "" });
  const [contactForm, setContactForm] = useState({ label: "", number: "" });

  function submitSchedule(e) {
    e.preventDefault();
    onAddScheduleItem(scheduleForm.label.trim(), scheduleForm.text.trim());
    setScheduleForm({ label: "", text: "" });
  }

  function submitContact(e) {
    e.preventDefault();
    onAddContact(contactForm.label.trim(), contactForm.number.trim());
    setContactForm({ label: "", number: "" });
  }

  return (
    <section>
      <div className="organizer-top">
        <div>
          <h1>My Personal Health Organizer</h1>
          <p className="organizer-subtitle">A safe, private place to manage my wellness schedule.</p>
        </div>
        <button className="reminder no-print" onClick={() => window.print()}>
          🖨 Print
        </button>
      </div>

      <hr />

      <div className="panel">
        <h2>💊 Daily Medicine Schedule</h2>
        <p>Take medications with a full glass of water as directed.</p>

        {organizer.schedule.length === 0 && <div className="empty">No schedule items. Add one below.</div>}

        <ul className="organizer-list">
          {organizer.schedule.map((item) => (
            <li key={item.id}>
              <span>
                <strong>{item.label}:</strong> {item.text}
              </span>
              <button className="delete small no-print" onClick={() => onDeleteScheduleItem(item.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>

        <form className="inline-form no-print" onSubmit={submitSchedule}>
          <input
            type="text"
            placeholder="Time (e.g. Morning (8:00 AM))"
            value={scheduleForm.label}
            onChange={(e) => setScheduleForm({ ...scheduleForm, label: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Medicine - dose (e.g. Vitamin C - 1 Tablet)"
            value={scheduleForm.text}
            onChange={(e) => setScheduleForm({ ...scheduleForm, text: e.target.value })}
            required
          />
          <button className="primary" type="submit">
            Add to Schedule
          </button>
        </form>
      </div>

      <hr />

      <div className="panel">
        <h2>📅 Doctor Appointments</h2>

        {upcomingAppointments.length === 0 && <div className="empty">No upcoming appointments.</div>}

        <ul className="organizer-list">
          {upcomingAppointments.map((a) => (
            <li key={a.id}>
              <span>
                <strong>{a.doctor}</strong> ({a.hospital || "clinic not specified"}): {a.date} at {a.time}
              </span>
            </li>
          ))}
        </ul>

        <button className="reminder no-print" onClick={onGoToAppointments}>
          Manage Appointments
        </button>
      </div>

      <hr />

      <div className="panel">
        <h2>📞 Emergency Health Contacts</h2>

        {organizer.contacts.length === 0 && <div className="empty">No contacts. Add one below.</div>}

        <ul className="organizer-list">
          {organizer.contacts.map((c) => (
            <li key={c.id}>
              <span>
                <strong>{c.label}:</strong> {c.number}
              </span>
              <button className="delete small no-print" onClick={() => onDeleteContact(c.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>

        <form className="inline-form no-print" onSubmit={submitContact}>
          <input
            type="text"
            placeholder="Contact name (e.g. Ambulance)"
            value={contactForm.label}
            onChange={(e) => setContactForm({ ...contactForm, label: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Phone number"
            value={contactForm.number}
            onChange={(e) => setContactForm({ ...contactForm, number: e.target.value })}
            required
          />
          <button className="primary" type="submit">
            Add Contact
          </button>
        </form>
      </div>

      <div className="actions no-print organizer-tools">
        <button className="taken" onClick={onRestoreSample}>
          Restore Sample Data
        </button>
        <button className="delete" onClick={onClearAll}>
          Clear All
        </button>
      </div>

      <p className="note">
        <em>Note: Always consult a doctor or healthcare professional before changing your medication routine.</em>
      </p>
    </section>
  );
}

/* =========================================================
   PAGE: PROJECT REPORT (Aim, Explanation, Source, Output, Result)
   ========================================================= */
const SOURCE_FILES = [
  { name: "src/main.jsx", code: mainSource },
  { name: "src/index.css", code: indexCss },
  { name: "src/App.css", code: appCss },
  { name: "src/App.jsx", code: appSource },
];

function ProjectPage() {
  return (
    <section className="project-report">
      <h1>MedCare – My Personal Health Organizer</h1>
      <p><b>B.Tech – Full Stack Development (FSD) Lab Project</b></p>

      <div className="panel">
        <h2>1. Aim</h2>
        <p>
          To design and develop a web-based Personal Health Organizer named MedCare using React.js and Vite,
          which manages daily medicines, doctor appointments and emergency contacts, sends medicine reminders
          using the Browser Notifications API, and stores all data in LocalStorage so it remains after a refresh.
        </p>
      </div>

      <div className="panel">
        <h2>2. Project Explanation</h2>
        <ul className="report-list">
          <li><b>Technology:</b> React 18, JavaScript, Vite, HTML5, CSS3, LocalStorage, Browser Notifications API.</li>
          <li><b>Dashboard:</b> counts of medicines, appointments and doses taken today; next appointment; pending and overdue doses.</li>
          <li><b>Medicines:</b> add, view, mark as taken, send reminder and delete (with confirmation).</li>
          <li><b>Appointments:</b> add appointments; upcoming and past lists; past dates are rejected.</li>
          <li><b>Health Organizer:</b> editable daily schedule, appointments and emergency contacts; print option.</li>
          <li><b>Reminders:</b> the app checks every 30 seconds; at the set time it shows a banner and a browser notification.</li>
        </ul>
      </div>

      <div className="panel">
        <h2>3. Source Code</h2>
        <p>The source code of the main project files is shown below. Click a file name to expand it.</p>
        {SOURCE_FILES.map((file) => (
          <details key={file.name} className="source-file">
            <summary>{file.name}</summary>
            <pre className="code">{file.code}</pre>
          </details>
        ))}
      </div>

      <div className="panel">
        <h2>4. Expected Output</h2>
        <ul className="report-list">
          <li>Dashboard counts match the data added.</li>
          <li>Added medicines and appointments appear in their lists and remain after refresh.</li>
          <li>Mark Taken increases the Doses Taken Today count.</li>
          <li>Validation errors appear for an end date before the start date, or a past appointment.</li>
          <li>A reminder banner (and browser notification, if allowed) appears at the set time.</li>
          <li>Health Organizer items can be added and removed, and the Print button opens the print dialog.</li>
        </ul>
      </div>

      <div className="panel">
        <h2>5. Output</h2>
        <p>
          Open the Dashboard, Medicines, Add Medicine, Appointments and Health Organizer pages in this app.
          Each page is the output of the project and can be shown during the demonstration.
        </p>
      </div>

      <div className="panel">
        <h2>6. Result</h2>
        <p>
          MedCare was developed as a React single-page application. Five pages work without reloading the browser,
          data is saved in LocalStorage, reminders are shown on screen and as browser notifications, and
          validation prevents invalid dates. The project meets the objectives of the FSD lab.
        </p>
      </div>
    </section>
  );
}

/* =========================================================
   MAIN APP (holds all state)
   ========================================================= */
export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Data (same LocalStorage keys as the original MedCare file, plus "healthOrganizer")
  const [medicines, setMedicines] = useState(() => loadFromStorage("medicines", []));
  const [appointments, setAppointments] = useState(() => loadFromStorage("appointments", []));
  const [takenDoses, setTakenDoses] = useState(() => loadFromStorage("takenDoses", []));
  const [organizer, setOrganizer] = useState(() => loadFromStorage("healthOrganizer", SAMPLE_ORGANIZER));

  // Toast message (type: "success" or "error")
  const [toast, setToast] = useState(null);

  // On-screen reminders (shown even if browser notifications are blocked)
  const [reminders, setReminders] = useState([]);

  const today = getTodayString();
  const nowTime = getCurrentTimeString();

  /* ---------- LocalStorage synchronization ---------- */
  useEffect(() => localStorage.setItem("medicines", JSON.stringify(medicines)), [medicines]);
  useEffect(() => localStorage.setItem("appointments", JSON.stringify(appointments)), [appointments]);
  useEffect(() => localStorage.setItem("takenDoses", JSON.stringify(takenDoses)), [takenDoses]);
  useEffect(() => localStorage.setItem("healthOrganizer", JSON.stringify(organizer)), [organizer]);

  // Hide the toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  function notify(text, type = "success") {
    setToast({ text, type, id: Date.now() });
  }

  /* ---------- Reminders (on-screen + browser notification) ---------- */
  function pushReminder(medicine) {
    setReminders((prev) =>
      [{ id: Date.now() + Math.random(), name: medicine.name, dosage: medicine.dosage }, ...prev].slice(0, 5)
    );
  }

  function dismissReminder(id) {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }

  // Sends a reminder: always shows it on screen, and a browser notification if allowed
  async function sendReminder(medicine) {
    pushReminder(medicine);

    if (!("Notification" in window)) {
      notify("Browser notifications are not supported. Reminder shown on screen.", "error");
      return;
    }

    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission === "granted") {
      new Notification("💊 Medicine Reminder", {
        body: `Time to take ${medicine.name} - ${medicine.dosage}`,
      });
      notify("Reminder notification sent.");
    } else {
      notify("Notifications are blocked. Reminder shown on screen.", "error");
    }
  }

  // Automatic reminder check every 30 seconds while the app is open
  useEffect(() => {
    function checkReminders() {
      const todayStr = getTodayString();
      const nowStr = getCurrentTimeString();

      medicines.forEach((medicine) => {
        if (medicine.time !== nowStr) return;
        if (!isActiveOn(medicine, todayStr)) return;

        // Each medicine is reminded only once per day at that time
        const key = `notified-${todayStr}-${medicine.id}`;
        if (localStorage.getItem(key)) return;

        localStorage.setItem(key, "true");
        sendReminder(medicine);
      });
    }

    const intervalId = setInterval(checkReminders, 30000);
    return () => clearInterval(intervalId);
  }, [medicines]);

  /* ---------- Medicine actions ---------- */

  // Returns true if saved, false if validation failed
  function addMedicine(newMedicine) {
    if (newMedicine.endDate < newMedicine.startDate) {
      notify("End date cannot be before the start date.", "error");
      return false;
    }
    setMedicines((prev) => [...prev, newMedicine]);
    notify("Medicine added successfully!");
    return true;
  }

  function deleteMedicine(id) {
    if (!window.confirm("Are you sure you want to delete this medicine?")) return;
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    setTakenDoses((prev) => prev.filter((key) => !key.endsWith(`-${id}`)));
    notify("Medicine deleted.");
  }

  function markTaken(id) {
    const key = `${today}-${id}`;
    if (takenDoses.includes(key)) return;
    setTakenDoses((prev) => [...prev, key]);
    notify("Medicine marked as taken.");
  }

  function isTakenToday(id) {
    return takenDoses.includes(`${today}-${id}`);
  }

  /* ---------- Appointment actions ---------- */

  // Returns true if saved, false if validation failed
  function addAppointment(newAppointment) {
    if (isPastAppointment(newAppointment, today, nowTime)) {
      notify("Appointment date/time cannot be in the past.", "error");
      return false;
    }
    setAppointments((prev) => [...prev, newAppointment]);
    notify("Appointment added successfully.");
    return true;
  }

  function deleteAppointment(id) {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    notify("Appointment deleted.");
  }

  /* ---------- Health Organizer actions ---------- */

  function addScheduleItem(label, text) {
    setOrganizer((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { id: Date.now(), label, text }],
    }));
    notify("Schedule item added.");
  }

  function deleteScheduleItem(id) {
    setOrganizer((prev) => ({ ...prev, schedule: prev.schedule.filter((s) => s.id !== id) }));
  }

  function addContact(label, number) {
    setOrganizer((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { id: Date.now(), label, number }],
    }));
    notify("Contact added.");
  }

  function deleteContact(id) {
    setOrganizer((prev) => ({ ...prev, contacts: prev.contacts.filter((c) => c.id !== id) }));
  }

  function restoreSample() {
    setOrganizer(SAMPLE_ORGANIZER);
    notify("Sample data restored.");
  }

  function clearAllOrganizer() {
    if (!window.confirm("Clear all schedule items and contacts?")) return;
    setOrganizer({ schedule: [], contacts: [] });
    notify("Health Organizer cleared.");
  }

  /* ---------- Derived data ---------- */
  const todayMedicines = medicines.filter((m) => isActiveOn(m, today));
  const upcomingAppointments = appointments
    .filter((a) => !isPastAppointment(a, today, nowTime))
    .sort(sortAppointments);
  const nextAppointment = upcomingAppointments[0];

  /* ---------- Page rendering (conditional rendering) ---------- */
  function renderPage() {
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage
            medicines={medicines}
            appointmentCount={appointments.length}
            takenDoses={takenDoses}
            today={today}
            nowTime={nowTime}
            nextAppointment={nextAppointment}
            todayMedicines={todayMedicines}
            isTakenToday={isTakenToday}
            onMarkTaken={markTaken}
            onRemind={sendReminder}
          />
        );
      case "medicines":
        return (
          <MedicinesPage
            medicines={medicines}
            onRemind={sendReminder}
            onMarkTaken={markTaken}
            onDelete={deleteMedicine}
          />
        );
      case "addMedicine":
        return <AddMedicinePage onAddMedicine={addMedicine} />;
      case "appointments":
        return (
          <AppointmentsPage
            appointments={appointments}
            today={today}
            nowTime={nowTime}
            onAddAppointment={addAppointment}
            onDeleteAppointment={deleteAppointment}
          />
        );
      case "project":
        return <ProjectPage />;
      case "organizer":
        return (
          <HealthOrganizerPage
            organizer={organizer}
            upcomingAppointments={upcomingAppointments}
            onAddScheduleItem={addScheduleItem}
            onDeleteScheduleItem={deleteScheduleItem}
            onAddContact={addContact}
            onDeleteContact={deleteContact}
            onRestoreSample={restoreSample}
            onClearAll={clearAllOrganizer}
            onGoToAppointments={() => setCurrentPage("appointments")}
          />
        );
      default:
        return null;
    }
  }

  return (
    <>
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />

      <div className="container">
        {reminders.map((r) => (
          <div className="reminder-banner no-print" key={r.id}>
            <span>
              🔔 <b>Time to take {r.name}</b> – {r.dosage}
            </span>
            <button className="btn-dismiss" onClick={() => dismissReminder(r.id)}>
              Dismiss
            </button>
          </div>
        ))}

        {toast && <div className={`message ${toast.type === "error" ? "error" : ""}`}>{toast.text}</div>}

        {renderPage()}
      </div>

      <footer className="no-print">MedCare © 2026 | Medicine organizer and reminder application</footer>
    </>
  );
}
