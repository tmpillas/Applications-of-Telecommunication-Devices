
document.getElementById("temp").innerText = "24";
document.getElementById("humidity").innerText = "55";
document.getElementById("motion").innerText = "Καμία";
document.getElementById("finger").innerText = "Χωρίς αποτύπωμα";

function toggleAlarm(state) {
  const statusEl = document.getElementById("alarmStatus");
  statusEl.innerText = state ? "Ενεργοποιημένος" : "Απενεργοποιημένος";

  // Εδώ θα προσθέσουμε σύνδεση με Firebase ή ESP32
  console.log("Συναγερμός:", state ? "ON" : "OFF");
}

// Motion Detection
function updateMotion(status) {
  const now = new Date().toLocaleString('el-GR'); // περιλαμβάνει ημερομηνία + ώρα
  document.getElementById("motion").innerText = status;

  if (status === "Ναι") {
    document.getElementById("motionTime").innerText = now;
    motionHistory.push(now);
    addToHistory(now);
  }
}

function toggleHistory() {
  const section = document.getElementById("motionHistorySection");
  const btn = document.getElementById("historyBtn");

  if (section.style.display === "none") {
    section.style.display = "block";
    btn.textContent = "❌ Απόκρυψη Ιστορικού";
  } else {
    section.style.display = "none";
    btn.textContent = "📜 Προβολή Ιστορικού";
  }
}

// Fingerprint
function updateFingerprint(result, remainingAttempts) {
  const statusEl = document.getElementById("fingerStatus");
  const attemptsEl = document.getElementById("fingerAttempts");

  if (remainingAttempts <= 0) {
    statusEl.innerText = "🚫 Κλείδωμα λόγω αποτυχημένων προσπαθειών";
    statusEl.style.color = "darkred";
    attemptsEl.innerText = "0";
    // Προαιρετικά: απενεργοποίηση άλλων controls ή ειδοποίηση
    return;
  }

  statusEl.innerText = result === "OK" ? "Αποδεκτό" : "Μη αποδεκτό";
  statusEl.style.color = result === "OK" ? "green" : "red";
  attemptsEl.innerText = remainingAttempts;
}

window.onload = () => {
  const data = {
    finger: "FAIL",   // ή "OK"
    attemptsLeft: 2
  };

  updateFingerprint(data.finger, data.attemptsLeft);
};





