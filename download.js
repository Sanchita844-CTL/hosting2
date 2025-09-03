// Utility function
const pad = n => n < 10 ? '0'+n : n;

// Download CSV
function downloadCSV(rows, filename) {
  if (!rows.length) { alert("No data to download."); return; }
  const header = ["Date","Time","Temperature","IR"];
  const lines = [header.join(",")];
  rows.forEach(r => {
    const d = new Date(r.timestamp);
    lines.push([
      `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,
      `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
      r.temperature,
      r.ir
    ].join(","));
  });
  const blob = new Blob([lines.join("\n")], {type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  addToHistory(filename);
}

// Add download to history and save to localStorage
function addToHistory(filename) {
  const tbody = document.querySelector("#history-table tbody");
  const now = new Date();
  const entry = {
    filename,
    date: `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  };

  let history = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
  history.unshift(entry);
  localStorage.setItem('downloadHistory', JSON.stringify(history));
  renderHistory();
}

// Render history table from localStorage
function renderHistory() {
  const tbody = document.querySelector("#history-table tbody");
  tbody.innerHTML = '';
  const history = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
  history.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.filename}</td>
      <td>${item.date}</td>
      <td>${item.time}</td>
    `;
    tbody.appendChild(row);
  });
}

// Fetch Firebase data
window.addEventListener('DOMContentLoaded', () => {
  const firebaseConfig = {
    databaseURL: "https://tempval-6f873-default-rtdb.asia-southeast1.firebasedatabase.app/"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const ref = db.ref("sensor_data");

  // Default dates
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);
  const formatDate = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  document.getElementById('start-date').value = formatDate(oneWeekAgo);
  document.getElementById('end-date').value = formatDate(today);

  // Render history on load
  renderHistory();

  document.getElementById('download-csv').addEventListener('click', async () => {
    const startStr = document.getElementById('start-date').value;
    const endStr = document.getElementById('end-date').value;

    if (!startStr || !endStr) { alert("Please select both start and end dates."); return; }

    const start = new Date(startStr);
    const end = new Date(endStr);
    end.setHours(23,59,59,999);

    const snapshot = await ref.get();
    const dataObj = snapshot.val();
    if (!dataObj) { alert("No data available."); return; }

    // Filter data by date
    const filtered = Object.values(dataObj).filter(d => {
      const t = new Date(d.timestamp);
      return t >= start && t <= end;
    });

    // Show preview (first 20 rows)
    const preview = document.getElementById('preview');
    if (!filtered.length) {
      preview.innerHTML = `<p><i class="fas fa-exclamation-circle" style="color:red;"></i> No data found.</p>`;
    } else {
      let html = "<table><thead><tr><th>Date</th><th>Time</th><th>Temp</th><th>IR</th></tr></thead><tbody>";
      filtered.slice(0,20).forEach(r=>{
        const d = new Date(r.timestamp);
        html+=`<tr>
          <td>${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}</td>
          <td>${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}</td>
          <td>${r.temperature}</td>
          <td>${r.ir}</td>
        </tr>`;
      });
      html+="</tbody></table>";
      preview.innerHTML = html;
    }

    const filename = `sensor_${startStr}_to_${endStr}.csv`;
    downloadCSV(filtered, filename);
  });
});
