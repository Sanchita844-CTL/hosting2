window.addEventListener('DOMContentLoaded', () => {
  const firebaseConfig = {
    databaseURL: "https://tempval-6f873-default-rtdb.asia-southeast1.firebasedatabase.app/"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const ref = db.ref("sensor_data");

  // Elements
  const tableBody = document.querySelector("#sensorTable tbody");
  const tempEl = document.getElementById("temp");
  const irEl = document.getElementById("ir");
  const tempCard = document.getElementById("tempCard");
  const irCard = document.getElementById("irCard");
  const alarm = document.getElementById("alarmSound");

  const TEMP_ALERT_THRESHOLD = 150.0;

  // Chart setup
  const ctx = document.getElementById('combinedChart').getContext('2d');
  const combinedChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        { label: 'Temperature (°C)', data: [], borderColor: '#1e88e5', yAxisID: 'y', fill: false, tension: 0.2 },
        { label: 'IR Sensor', data: [], borderColor: '#e53935', yAxisID: 'y1', fill: false, tension: 0.2 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      stacked: false,
      scales: {
        y: { type: 'linear', position: 'left', title: { display: true, text: 'Temperature (°C)' } },
        y1: { type: 'linear', position: 'right', title: { display: true, text: 'IR Sensor' }, min: 0, max: 1, grid: { drawOnChartArea: false } },
        x: { title: { display: true, text: 'Time' } }
      }
    }
  });

  // Firebase listener
  ref.limitToLast(20).on('child_added', snapshot => {
    const data = snapshot.val();
    if (!data) return;

    const tempVal = Number(data.temperature);
    const irVal = Number(data.ir);
    const timeLabel = data.timestamp.split(" ")[1];

    // Update cards
    tempEl.textContent = tempVal.toFixed(1);
    irEl.textContent = irVal;
    tempCard.classList.toggle("alert", tempVal > TEMP_ALERT_THRESHOLD);
    irCard.classList.toggle("alert", irVal !== 1 && irVal !== 0);

    // Alarm
    if (tempVal > TEMP_ALERT_THRESHOLD) alarm.play().catch(() => {});
    else { alarm.pause(); alarm.currentTime = 0; }

    // Update table
    const row = document.createElement("tr");
    if (tempVal > TEMP_ALERT_THRESHOLD) row.classList.add("alert");
    row.innerHTML = `<td>${timeLabel}</td><td>${tempVal.toFixed(1)}</td><td>${irVal}</td>`;
    tableBody.appendChild(row);
    if (tableBody.rows.length > 20) tableBody.deleteRow(0);

    // Update chart
    combinedChart.data.labels.push(timeLabel);
    combinedChart.data.datasets[0].data.push(tempVal);
    combinedChart.data.datasets[1].data.push(irVal);
    if (combinedChart.data.labels.length > 20) {
      combinedChart.data.labels.shift();
      combinedChart.data.datasets[0].data.shift();
      combinedChart.data.datasets[1].data.shift();
    }
    combinedChart.update();
  });
});

// ===== Sidebar toggle =====
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebarToggle');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker Registered', reg))
      .catch(err => console.log('Service Worker registration failed', err));
  });
}



