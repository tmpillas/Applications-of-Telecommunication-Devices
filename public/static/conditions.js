  async function updateConditions() {
    try {
      const res = await fetch('/data');
      const data = await res.json();

      document.getElementById('temperature').textContent = data.temperature + ' °C';
      document.getElementById('humidity').textContent = data.humidity + ' %'; 

    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }

  setInterval(updateConditions, 1000); // Refresh every second
  updateConditions(); // Initial fetch