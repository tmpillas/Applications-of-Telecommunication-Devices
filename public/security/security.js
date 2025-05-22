const motionHistory = [
      "2024-05-19 21:30:12",
      "2024-05-19 19:02:45",
      "2024-05-18 22:14:03"
    ];

    function addToHistory(time) {
      const list = document.getElementById("motionHistoryList");
      const li = document.createElement("li");
      li.textContent = time;
      list.prepend(li);
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

    function toggleAlarm(state) {
      const statusEl = document.getElementById("alarmStatus");
      statusEl.innerText = state ? "Ενεργοποιημένος" : "Απενεργοποιημένος";
      console.log("Συναγερμός:", state ? "ON" : "OFF");
    }

    function updateMotion(status) {
      const now = new Date().toLocaleString('el-GR');
      document.getElementById("motion").innerText = status;

      if (status === "Ναι") {
        document.getElementById("motionTime").innerText = now;
        motionHistory.push(now);
        addToHistory(now);
      }
    }

    function updateFingerprint(result, remainingAttempts) {
      const statusEl = document.getElementById("fingerStatus");
      const attemptsEl = document.getElementById("fingerAttempts");

      if (remainingAttempts <= 0) {
        statusEl.innerText = "🚫 Κλείδωμα λόγω αποτυχημένων προσπαθειών";
        statusEl.style.color = "darkred";
        attemptsEl.innerText = "0";
        document.querySelectorAll(".controls button").forEach(btn => btn.disabled = true);
        return;
      }

      statusEl.innerText = result === "OK" ? "Αποδεκτός" : "Μη αποδεκτός";
      statusEl.style.color = result === "OK" ? "green" : "red";
      attemptsEl.innerText = remainingAttempts;

      document.querySelectorAll(".controls button").forEach(btn => btn.disabled = false);
    }

    window.onload = () => {
      updateFingerprint("FAIL", 2);
      updateMotion("Καμία");
    };