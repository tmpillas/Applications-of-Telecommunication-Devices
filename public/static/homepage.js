let data;

window.addEventListener("DOMContentLoaded", () => {
  const lastCheckSecurity = localStorage.getItem("lastCheckSecurity") || "Never";
  const lastCheckConditions = localStorage.getItem("lastCheckConditions") || "Never";


  const lastCheckElement = document.getElementById("last-check");
  if (lastCheckElement) {
    lastCheckElement.textContent = 
      `🔐Last Security Check: ${lastCheckSecurity} \n🌡️Last Conditions Check: ${lastCheckConditions}`;
  }

  const securityBtn = document.querySelector('a[href="security.html"]');
  const conditionsBtn = document.querySelector('a[href="conditions.html"]');

  if (securityBtn) {
    securityBtn.addEventListener("click", () => {
      const now = new Date();
      const formatted = now.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      localStorage.setItem("lastCheckSecurity", formatted);
    });
  }

  if (conditionsBtn) {
    conditionsBtn.addEventListener("click", () => {
      const now = new Date();
      const formatted = now.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      localStorage.setItem("lastCheckConditions", formatted);
    });
  }
});

const logoutBtn = document.getElementById("logout-btn");

function logout() {
  window.location.href = "login.html"; 
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}






// // Toggle the app state
// let appEnabled = true;

// function toggleApp() {
//   const appBtn = document.getElementById("appToggleBtn");
//   appEnabled = !appEnabled;

//   if (appEnabled) {
//     appBtn.classList.remove("off");
//   } else {
//     appBtn.classList.add("off");
//   }
// }


    let enabled;
     // Assume app is enabled by default
    async function toggleApp() {
    // let enabled = data.enabled;
      try {
        // Decide command based on current lock status
        const command = Number(enabled) ? "3" : "2"; // 1 for enabled, 0 for disabled
        // Send command to server
        const response = await fetch(`/send?message=${command}`);
        // response = await fetch('/send?message=0');

        // Optionally refresh lock status after sending
        setTimeout(fetchHomepageData, 500); // Delay briefly to let Arduino respond


      } catch (err) {
        console.error("Error sending lock command:", err);
      }
    }




    async function fetchHomepageData() {
  try {
    const appBtn = document.getElementById("appToggleBtn");
    const res = await fetch('/data');
    data = await res.json();
    enabled = data.enabled; // Store the enabled state
    if (Number(enabled)){
      appBtn.classList.remove("off");
    } else {
      appBtn.classList.add("off");
    }

  } catch (err) {
    console.error("Error fetching homepage data:", err);
  }
}
window.onload = () => {
  fetchHomepageData();
  setInterval(fetchHomepageData, 1000);
};