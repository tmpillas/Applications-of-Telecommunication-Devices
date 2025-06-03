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

    // Toggle lock DOULEVEI
    function toggleLock(isLocked) {
      const statusText = document.getElementById("lockStatus");
      const buttonEl = document.getElementById("lockToggleBtn");
      const statusIcon = document.getElementById("lockStatusIcon");

      if (isLocked === "1") {
        statusText.textContent = "Locked";
        statusText.style.color = "#16c60c";
        buttonEl.textContent = "🔓";
        statusIcon.src = "/static/images/check.png";    
        statusIcon.alt = "Locked";
        buttonEl.classList.remove("lock");
        buttonEl.classList.add("unlock");
      } else {
        statusText.textContent = "Unlocked⁉";
        statusText.style.color = "#ff4141";
        statusIcon.src = "/static/images/worry.png"; 
        statusIcon.alt = "Unlocked";
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
    toggleLock(data.isLocked);

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
