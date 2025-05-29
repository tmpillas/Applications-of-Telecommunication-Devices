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