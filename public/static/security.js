const motionHistory = [];
let lastDisplayedMotionTime = 0;
let lastMotion = "No"; // Initialize lastMotion to "No"
const DISPLAY_INTERVAL = 10000; // 10 seconds in milliseconds
    
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

    function arduinoLock(isLocked) {
      const statusEl = document.getElementById("lockStatus");
      const buttonEl = document.getElementById("lockToggleBtn");

      if (Number(isLocked)) {
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

    // Toggle lock DOULEVEI
    async function toggleLock() {
      try {
        const statusEl = document.getElementById("lockStatus");

        // Decide command based on current lock status
        const command = statusEl.textContent === "Locked✔️" ? "1" : "0";
        // Send command to server
        const response = await fetch(`/send?message=${command}`);
        // response = await fetch('/send?message=0');

        // Optionally refresh lock status after sending
        setTimeout(fetchSecurityData, 500); // Delay briefly to let Arduino respond

      } catch (err) {
        console.error("Error sending lock command:", err);
      }
    }

    function toggleAlarm(state) {
      const statusEl = document.getElementById("alarmStatus");
      statusEl.innerText = state ? "Enabled" : "Disabled";
      console.log("Alarm:", state ? "ON" : "OFF");
      statusEl.style.color = state ? "green" : "red";
    }

    // function updateMotion(status) {
    //   const now = new Date();
    //   const nowFormatted = now.toLocaleString('en-US');
    //   const nowMillis = now.getTime();

    //   if (status === "Yes") {
    //     motionHistory.push(nowFormatted);
        
        
    //     if (
    //       nowMillis - lastDisplayedMotionTime >= DISPLAY_INTERVAL ||
    //       motionHistory.length === 1
    //     ) {
    //       document.getElementById("motion").textContent = status;
    //       document.getElementById("motionTime").innerText = nowFormatted;
    //       addToHistory(nowFormatted);
    //       lastDisplayedMotionTime = nowMillis;
    //     }
    //   } else {
    //     document.getElementById("motion").textContent = "No";
    //   }
    // }
    // function updateMotion(status) {
    //   const now = new Date().toLocaleString('en-US');     
    //   document.getElementById("motion").textContent = status;

    //   if (status === "Yes") {
    //     document.getElementById("motionTime").innerText = now;
    //     motionHistory.push(now);
    //     addToHistory(now);
    //   }
    // }
     function updateMotion(status) {
      const now = new Date().toLocaleString('en-US');     
      document.getElementById("motion").textContent = status;

      if (status !== lastMotion) {
        lastMotion = status; 
        if (status === "Yes") {
          document.getElementById("motionTime").innerText = now;
          motionHistory.push(now);
          addToHistory(now);
        }
      }
    }

    function updateCode(result, remainingAttempts) {
      document.getElementById('codeStatus').textContent = result;
      document.getElementById('codeAttempts').textContent = remainingAttempts;
    }

    // function toggleLockEXT() {
    //   serialPort.write('1'); // Send 1 to toggle lock
    // }


async function fetchSecurityData() {
  try {
    //serialPort.write('1\n');
    const res = await fetch('/data');
    const data = await res.json();

    //Lock status
    arduinoLock(data.isLocked);

    // Alarm status
    toggleAlarm(data.isAlarmOn === "1");

    // Code validation
    if ( data.attemptsLeft === "3") {
      updateCode("ENTER CODE", parseInt(data.attemptsLeft));
    }
    else if  (data.isCorrectCode === "1" && data.attemptsLeft === "2") {
      updateCode("OK", parseInt(data.attemptsLeft));
    }
    else if  (data.isCorrectCode === "1" && data.attemptsLeft === "1") {
      updateCode("OK", parseInt(data.attemptsLeft));
    }
    else if (data.isCorrectCode === "0") {
      updateCode("FAIL", parseInt(data.attemptsLeft));
    }
    // updateCode(data.isCorrectCode === "1" ? "OK" : "FAIL", parseInt(data.attemptsLeft));

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