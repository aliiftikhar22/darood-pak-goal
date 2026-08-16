/*
  DAROOD PAK GOAL
  ------------------------------------------------------------
  1) For a real multi-user website, create a Firebase project.
  2) Enable Firestore Database.
  3) Put your Firebase web config in firebaseConfig below.
  4) Set FIREBASE_ENABLED = true.
  5) Deploy these files to your hosting provider.

  The fallback demo mode keeps the site working locally using localStorage.
*/

const GOAL = 10_000_000;

// IMPORTANT: 12 Rabi ul Awwal varies by moon-sighting/calendar.
// Set this to the locally confirmed Gregorian date/time before launch.
// Example format: "2026-08-27T23:59:59+05:00"
const TARGET_DATE = "2026-08-25T23:59:59+05:00";
const FIREBASE_ENABLED = false;

const firebaseConfig = {
  apiKey: "AIzaSyCF2EcEDt8G0iU_tv9H9A6VNil3duJIIo4",
  authDomain: "cr-darood-pak.firebaseapp.com",
  projectId: "cr-darood-pak",
  storageBucket: "cr-darood-pak.firebasestorage.app",
  messagingSenderId: "659293327215",
  appId: "1:659293327215:web:d34c2c58a68def59d9a29a"
};

const $ = (id) => document.getElementById(id);
const format = (n) => Number(n).toLocaleString("en-US");

function getLocalContributions() {
  try { return JSON.parse(localStorage.getItem("darood_contributions") || "[]"); }
  catch { return []; }
}

function saveLocalContributions(items) {
  localStorage.setItem("darood_contributions", JSON.stringify(items));
}

function renderStats(items) {
  const total = Math.min(items.reduce((sum, item) => sum + Number(item.count || 0), 0), GOAL);
  const remaining = Math.max(GOAL - total, 0);
  const percent = Math.min((total / GOAL) * 100, 100);

  $("totalDisplay").textContent = format(total);
  $("remainingDisplay").textContent = format(remaining);
  $("remainingMini").textContent = format(remaining);
  $("contributorsMini").textContent = format(items.length);
  $("percentDisplay").textContent = `${percent.toFixed(percent < 10 ? 1 : 0)}%`;
  $("progressBar").style.width = `${percent}%`;
}

function renderContributions(items) {
  const container = $("contributions");
  if (!items.length) {
    container.innerHTML = `<div class="empty">No contributions yet. Be the first to add Darood Pak ﷺ.</div>`;
    return;
  }

  container.innerHTML = items.slice(0, 12).map(item => {
    const safeName = escapeHtml(item.name?.trim() || "Anonymous");
    const safeCity = escapeHtml(item.city?.trim() || "");
    const time = item.createdAt ? new Date(item.createdAt).toLocaleString() : "";
    return `
      <article class="contribution">
        <div class="contribution-top">
          <span class="contribution-name">${safeName}</span>
          <span class="contribution-count">+${format(item.count)}</span>
        </div>
        ${safeCity ? `<div class="contribution-city">${safeCity}</div>` : ""}
        ${time ? `<div class="contribution-time">${time}</div>` : ""}
      </article>
    `;
  }).join("");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[char]));
}

function updateCountdown() {
  const target = new Date(TARGET_DATE).getTime();
  const diff = Math.max(target - Date.now(), 0);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  $("days").textContent = String(days).padStart(2, "0");
  $("hours").textContent = String(hours).padStart(2, "0");
  $("minutes").textContent = String(minutes).padStart(2, "0");
  $("seconds").textContent = String(seconds).padStart(2, "0");
}

async function addContribution(data) {
  // Firebase mode is intentionally kept as a clearly marked extension point.
  // Import the Firebase modules in your deployed version and write to a
  // Firestore "contributions" collection using a transaction for the total.
  const items = getLocalContributions();
  items.unshift(data);
  saveLocalContributions(items);
  return items;
}

$("contributionForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const count = Number($("count").value);
  const message = $("formMessage");
  const button = $("submitBtn");

  if (!Number.isInteger(count) || count < 1 || count > 1_000_000) {
    message.textContent = "Please enter a number between 1 and 1,000,000.";
    return;
  }

  button.disabled = true;
  button.textContent = "Adding…";
  message.textContent = "";

  const data = {
    name: $("name").value.trim(),
    count,
    city: $("city").value.trim(),
    createdAt: new Date().toISOString()
  };

  try {
    const items = await addContribution(data);
    renderStats(items);
    renderContributions(items);
    $("contributionForm").reset();
    message.textContent = `JazakAllah khair! ${format(count)} Darood Pak added.`;
    message.style.color = "#0d5c4b";
  } catch (error) {
    console.error(error);
    message.textContent = "Something went wrong. Please try again.";
  } finally {
    button.disabled = false;
    button.textContent = "Add My Contribution";
  }
});

function init() {
  const items = getLocalContributions();
  renderStats(items);
  renderContributions(items);
  updateCountdown();
  setInterval(updateCountdown, 1000);

  if (FIREBASE_ENABLED) {
    console.warn("Firebase mode is enabled in configuration, but the starter build currently uses the local fallback. Connect Firestore transaction logic before launch.");
  }
}

init();
