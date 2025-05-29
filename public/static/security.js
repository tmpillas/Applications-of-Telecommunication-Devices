const motionHistory = [];
    
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
        btn.textContent = "❌ Hide history";
      } else {
        section.style.display = "none";
        btn.textContent = "📜 Display history";
      }
    }

    // Toggle lock DOULEVEI
    function toggleLock(isLocked) {
      const statusEl = document.getElementById("lockStatus");
      const buttonEl = document.getElementById("lockToggleBtn");

      if (isLocked === "1") {
        statusEl.textContent = "Locked✔️";
        statusEl.style.color = "green";
        buttonEl.textContent = "🔓";
        buttonEl.classList.remove("lock");
        buttonEl.classList.add("unlock");
      } else {
        statusEl.textContent = "Unlocked⁉️";
        statusEl.style.color = "red";
        buttonEl.textContent = "🔐";
        buttonEl.classList.remove("unlock");
        buttonEl.classList.add("lock");
      }
    }

    function toggleAlarm(state) {
      const statusEl = document.getElementById("alarmStatus");
      statusEl.innerText = state ? "Enabled" : "Disabled";
      console.log("Alarm:", state ? "ON" : "OFF");
      statusEl.style.color = state ? "green" : "red";
    }

    function updateMotion(status) {
      const now = new Date().toLocaleString('en-US');     
      document.getElementById("motion").textContent = status;

      if (status === "Yes") {
        document.getElementById("motionTime").innerText = now;
        motionHistory.push(now);
        addToHistory(now);
      }
    }

    function updateCode(result, remainingAttempts) {
      document.getElementById('codeStatus').textContent = result;
      document.getElementById('codeAttempts').textContent = remainingAttempts;
    }

async function fetchSecurityData() {
  try {
    const res = await fetch('/data');
    const data = await res.json();

    //Lock status
    toggleLock(data.isLocked);

    // Alarm status
    toggleAlarm(data.isAlarmOn === "1");

    // Code validation
    updateCode(data.isCorrectCode === "1" ? "OK" : "FAIL", parseInt(data.attemptsLeft));

    // Motion detection
    updateMotion(data.movementInHome === "1" ? "Yes" : "No");

  } catch (err) {
    console.error("Error fetching security data:", err);
  }
}
window.onload = () => {
  fetchSecurityData();
  setInterval(fetchSecurityData, 1000);
};
