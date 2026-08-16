import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =========================
   FIREBASE CONFIG
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyCF2EcEDt8G0iU_tv9H9A6VNil3duJIIo4",
  authDomain: "cr-darood-pak.firebaseapp.com",
  projectId: "cr-darood-pak",
  storageBucket: "cr-darood-pak.firebasestorage.app",
  messagingSenderId: "659293327215",
  appId: "1:659293327215:web:d34c2c58a68def59d9a29a"
};


/* =========================
   INITIALIZE FIREBASE
========================= */

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


/* =========================
   SETTINGS
========================= */

const GOAL = 10_000_000;

const TARGET_DATE = "2026-08-25T23:59:59+05:00";


/* =========================
   HELPERS
========================= */

const $ = (id) => document.getElementById(id);

const format = (n) =>
  Number(n).toLocaleString("en-US");


/* =========================
   RENDER STATS
========================= */

function renderStats(items) {

  const total = Math.min(
    items.reduce(
      (sum, item) => sum + Number(item.count || 0),
      0
    ),
    GOAL
  );

  const remaining = Math.max(
    GOAL - total,
    0
  );

  const percent = Math.min(
    (total / GOAL) * 100,
    100
  );

  $("totalDisplay").textContent =
    format(total);

  $("remainingDisplay").textContent =
    format(remaining);

  $("remainingMini").textContent =
    format(remaining);

  $("contributorsMini").textContent =
    format(items.length);

  $("percentDisplay").textContent =
    `${percent.toFixed(percent < 10 ? 1 : 0)}%`;

  $("progressBar").style.width =
    `${percent}%`;
}


/* =========================
   ESCAPE HTML
========================= */

function escapeHtml(value) {

  return value.replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char])
  );
}


/* =========================
   RENDER CONTRIBUTIONS
========================= */

function renderContributions(items) {

  const container =
    $("contributions");

  if (!items.length) {

    container.innerHTML =
      `<div class="empty">
        No contributions yet.
        Be the first to add Darood Pak ﷺ.
      </div>`;

    return;
  }

  container.innerHTML =
    items.slice(0, 12).map(item => {

      const safeName =
        escapeHtml(
          item.name?.trim() ||
          "Anonymous"
        );

      const safeCity =
        escapeHtml(
          item.city?.trim() ||
          ""
        );

      let time = "";

      if (item.createdAt) {

        if (
          typeof item.createdAt.toDate ===
          "function"
        ) {

          time =
            item.createdAt
              .toDate()
              .toLocaleString();

        } else {

          time =
            new Date(
              item.createdAt
            ).toLocaleString();
        }
      }

      return `
        <article class="contribution">

          <div class="contribution-top">

            <span class="contribution-name">
              ${safeName}
            </span>

            <span class="contribution-count">
              +${format(item.count)}
            </span>

          </div>

          ${
            safeCity
              ? `<div class="contribution-city">
                   ${safeCity}
                 </div>`
              : ""
          }

          ${
            time
              ? `<div class="contribution-time">
                   ${time}
                 </div>`
              : ""
          }

        </article>
      `;

    }).join("");
}


/* =========================
   COUNTDOWN
========================= */

function updateCountdown() {

  const target =
    new Date(TARGET_DATE).getTime();

  const diff =
    Math.max(
      target - Date.now(),
      0
    );

  const days =
    Math.floor(
      diff / 86400000
    );

  const hours =
    Math.floor(
      (diff % 86400000) / 3600000
    );

  const minutes =
    Math.floor(
      (diff % 3600000) / 60000
    );

  const seconds =
    Math.floor(
      (diff % 60000) / 1000
    );

  $("days").textContent =
    String(days).padStart(2, "0");

  $("hours").textContent =
    String(hours).padStart(2, "0");

  $("minutes").textContent =
    String(minutes).padStart(2, "0");

  $("seconds").textContent =
    String(seconds).padStart(2, "0");
}


/* =========================
   LOAD CONTRIBUTIONS
========================= */

async function loadContributions() {

  const snapshot =
    await getDocs(
      query(
        collection(
          db,
          "contributions"
        ),
        orderBy(
          "createdAt",
          "desc"
        )
      )
    );

  return snapshot.docs.map(doc => ({

    id: doc.id,

    ...doc.data()

  }));
}


/* =========================
   ADD CONTRIBUTION
========================= */

async function addContribution(data) {

  await addDoc(
    collection(
      db,
      "contributions"
    ),
    data
  );

  return await loadContributions();
}


/* =========================
   FORM
========================= */

const contributionForm =
  $("contributionForm");

if (contributionForm) {

  contributionForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const count =
        Number(
          $("count").value
        );

      const message =
        $("formMessage");

      const button =
        $("submitBtn");


      if (
        !Number.isInteger(count) ||
        count < 1 ||
        count > 1_000_000
      ) {

        message.textContent =
          "Please enter a number between 1 and 1,000,000.";

        return;
      }


      button.disabled = true;

      button.textContent =
        "Adding…";

      message.textContent =
        "";


      const data = {

        name:
          $("name").value.trim(),

        count: count,

        city:
          $("city").value.trim(),

        createdAt:
          serverTimestamp()

      };


      try {

        const items =
          await addContribution(data);


        renderStats(items);

        renderContributions(items);


        contributionForm.reset();


        message.textContent =
          `JazakAllah khair! ${format(count)} Darood Pak added.`;

        message.style.color =
          "#0d5c4b";


      } catch (error) {

        console.error(
          "Contribution error:",
          error
        );

        message.textContent =
          "Something went wrong. Please try again.";


      } finally {

        button.disabled =
          false;

        button.textContent =
          "Add My Contribution";

      }

    }
  );

}


/* =========================
   INITIALIZE WEBSITE
========================= */

async function init() {

  try {

    const items =
      await loadContributions();

    renderStats(items);

    renderContributions(items);

  } catch (error) {

    console.error(
      "Firebase error:",
      error
    );

    const contributions =
      $("contributions");

    if (contributions) {

      contributions.innerHTML =
        `<div class="empty">
          Unable to load contributions.
        </div>`;
    }
  }


  updateCountdown();


  setInterval(
    updateCountdown,
    1000
  );
}


/* =========================
   START
========================= */

init();
