
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
