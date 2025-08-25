window.addEventListener('DOMContentLoaded', () => {
  const firebaseConfig = {
    databaseURL: "https://tempval-6f873-default-rtdb.asia-southeast1.firebasedatabase.app/"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const ref = db.ref("sensor_data");

  const tableBody = document.querySelector("#monthlyTable tbody");
  const ctx = document.getElementById('monthlyChart').getContext('2d');

  const monthlyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        { label: 'Avg Temperature (°C)', data: [], borderColor: '#1e88e5', fill: false, tension: 0.2 },
        { label: 'Avg IR Sensor', data: [], borderColor: '#e53935', fill: false, tension: 0.2 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: false, title: { display: true, text: 'Temperature (°C)' } },
        y1: { beginAtZero: true, position: 'right', title: { display: true, text: 'IR Sensor' }, grid: { drawOnChartArea: false } },
        x: { title: { display: true, text: 'Date' } }
      }
    }
  });

  function fetchMonthlyData() {
    ref.get().then(snapshot => {
      const dataObj = snapshot.val();
      if (!dataObj) return;

      tableBody.innerHTML = '';
      monthlyChart.data.labels = [];
      monthlyChart.data.datasets[0].data = [];
      monthlyChart.data.datasets[1].data = [];

      // Define 30 days starting 20 Aug 2025
      const startDate = new Date("2025-08-20");
      const dayData = {};

      for (let i = 0; i < 30; i++) {
        const dateStr = startDate.toISOString().split('T')[0];
        dayData[dateStr] = { tempSum: 0, irSum: 0, count: 0 };
        startDate.setDate(startDate.getDate() + 1);
      }

      // Aggregate data per day
      Object.values(dataObj).forEach(d => {
        const date = d.timestamp.split(" ")[0];
        if (dayData[date]) {
          dayData[date].tempSum += Number(d.temperature);
          dayData[date].irSum += Number(d.ir);
          dayData[date].count += 1;
        }
      });

      Object.keys(dayData).forEach(date => {
        const { tempSum, irSum, count } = dayData[date];
        const avgTemp = count ? (tempSum / count).toFixed(1) : '--';
        const avgIr = count ? (irSum / count).toFixed(2) : '--';

        // Table
        const row = document.createElement('tr');
        row.innerHTML = `<td>${date}</td><td>${avgTemp}</td><td>${avgIr}</td>`;
        tableBody.appendChild(row);

        // Chart
        monthlyChart.data.labels.push(date);
        monthlyChart.data.datasets[0].data.push(count ? Number(avgTemp) : null);
        monthlyChart.data.datasets[1].data.push(count ? Number(avgIr) : null);
      });

      monthlyChart.update();
    });
  }

  fetchMonthlyData();
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

