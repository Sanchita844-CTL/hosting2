window.addEventListener('DOMContentLoaded', () => {
  const firebaseConfig = {
    databaseURL: "https://tempval-6f873-default-rtdb.asia-southeast1.firebasedatabase.app/"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const ref = db.ref("sensor_data");

  const tableBody = document.querySelector("#dailyTable tbody");
  const ctx = document.getElementById('dailyChart').getContext('2d');

  const dailyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Temperature (°C)',
          data: [],
          borderColor: '#1e88e5',
          fill: false,
          tension: 0.2
        },
        {
          label: 'IR Sensor',
          data: [],
          borderColor: '#e53935',
          fill: false,
          tension: 0.2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: false },
        x: { title: { display: true, text: 'Time' } }
      }
    }
  });

  function fetchDailyData() {
    ref.get().then(snapshot => {
      const dataObj = snapshot.val();
      if (!dataObj) return;

      tableBody.innerHTML = '';
      dailyChart.data.labels = [];
      dailyChart.data.datasets[0].data = [];
      dailyChart.data.datasets[1].data = [];

      const now = new Date();
      // Start of today (00:00:00)
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());


      let dataArray = Object.values(dataObj)
      .filter(d => new Date(d.timestamp) >= startOfToday)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));


      // Take one reading every 30 minutes
      let intervalData = [];
      let lastAddedTime = 0;
      dataArray.forEach(d => {
        let time = new Date(d.timestamp).getTime();
        if (time - lastAddedTime >= 30 * 60 * 1000 || lastAddedTime === 0) {
          intervalData.push(d);
          lastAddedTime = time;
        }
      });

      intervalData.forEach(d => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${d.timestamp}</td>
                         <td>${Number(d.temperature).toFixed(1)}</td>
                         <td>${Number(d.ir)}</td>`;
        tableBody.appendChild(row);

        dailyChart.data.labels.push(d.timestamp);
        dailyChart.data.datasets[0].data.push(Number(d.temperature));
        dailyChart.data.datasets[1].data.push(Number(d.ir));
      });

      dailyChart.update();
    });
  }

  fetchDailyData();
  setInterval(fetchDailyData, 300000); // refresh every 5 min
});

// ===== Sidebar toggle =====
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebarToggle');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('active');

});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker Registered', reg))
      .catch(err => console.log('Service Worker registration failed', err));
  });
}
