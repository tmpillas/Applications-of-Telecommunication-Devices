// homepage.js

window.addEventListener("DOMContentLoaded", () => {
  const lastCheck = localStorage.getItem("lastCheck");
  const lastCheckElement = document.getElementById("last-check");

  // Display last check date, if exists
  if (lastCheck && lastCheckElement) {
    lastCheckElement.textContent = `Last check: ${lastCheck}`;
  }

  // Last time pressed buttons (Security ή Conditions)
  const buttons = document.querySelectorAll(".button");
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const now = new Date();
      const formatted = now.toLocaleString("el-GR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      localStorage.setItem("lastCheck", formatted);
    });
  });
});
