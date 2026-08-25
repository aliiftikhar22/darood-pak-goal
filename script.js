import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot
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

// Darood Pak target is UNLIMITED.
// No GOAL value is required.

const TARGET_DATE = "2026-09-12T23:59:59+05:00";

/* =========================
   HELPERS
========================= */

const $ = (id) =>
  document.getElementById(id);

const format = (n) =>
  Number(n).toLocaleString("en-US");


/* =========================
   RENDER STATS
========================= */

function renderStats(items) {

  // Calculate the complete total from Firebase
  const total = items.reduce(
    (sum, item) =>
      sum + Number(item.count || 0),
    0
  );


  // Display total Darood Pak
  $("totalDisplay").textContent =
    format(total);


  // Unlimited target
  $("remainingDisplay").textContent =
    "∞";


  $("remainingMini").textContent =
    "∞";


  // Number of contributions
  $("contributorsMini").textContent =
    format(items.length);


  // Unlimited goal
  $("percentDisplay").textContent =
    "∞";


  // Keep progress bar visually full
  $("progressBar").style.width =
    "100%";
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

function watchContributions() {

  const contributionsQuery =
    query(
      collection(db, "contributions"),
      orderBy("createdAt", "desc")
    );


  return onSnapshot(
    contributionsQuery,

    (snapshot) => {

      const items =
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));


      renderStats(items);

      renderContributions(items);
    },


    (error) => {

      console.error(
        "Firebase realtime error:",
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
  );
}


/* =========================
   ADD CONTRIBUTION
========================= */

async function addContribution(data) {

  await addDoc(
    collection(db, "contributions"),
    data
  );
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


      /* =========================
         VALIDATE COUNT
      ========================= */

      // Unlimited contribution amount.
      // Only zero, negative numbers,
      // decimals and invalid values are rejected.

      if (
        !Number.isInteger(count) ||
        count < 1
      ) {

        message.textContent =
          "Please enter a valid whole number greater than 0.";

        return;
      }


      /* =========================
         DISABLE BUTTON
      ========================= */

      button.disabled =
        true;


      button.textContent =
        "Adding…";


      message.textContent =
        "";


      /* =========================
         CONTRIBUTION DATA
      ========================= */

      const data = {

        name:
          $("name").value.trim(),

        count:
          count,

        city:
          $("city").value.trim(),

        createdAt:
          serverTimestamp()
      };


      /* =========================
         SAVE TO FIREBASE
      ========================= */

      try {

        await addContribution(data);


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

function init() {

  // Start Firebase realtime listener
  watchContributions();


  // Start countdown
  updateCountdown();


  // Update countdown every second
  setInterval(
    updateCountdown,
    1000
  );
}


/* =========================
   START
========================= */

init();
