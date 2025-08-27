// -------------------- Firebase config (replace with your own) --------------------
const firebaseConfig = {
  apiKey: "AIzaSyDszlLsqxjEahtzDzvxQSAN5Rsa1nLEXCI",
  authDomain: "tempval-6f873.firebaseapp.com",
  databaseURL: "https://tempval-6f873-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tempval-6f873",
  storageBucket: "tempval-6f873.firebasestorage.app",
  messagingSenderId: "186313702442",
  appId: "1:186313702442:web:0ba8996907c5b4951ad753",
  measurementId: "G-2LMGE920EF"
};

// Init Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// -------------------- Helpers --------------------
function pad(n) { return n < 10 ? '0' + n : '' + n; }

function dateFromInputStr(s, endOfDay = false) {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (endOfDay) date.setHours(23, 59, 59, 999);
  else date.setHours(0, 0, 0, 0);
  return date;
}

function csvEscape(v) {
  if (v === null || v === undefined) return '';
  v = '' + v;
  if (v.includes('"') || v.includes(',') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

// -------------------- Fetch Data --------------------
async function fetchSensorData(startDate, endDate) {
  const snapshot = await database.ref("/sensor_data").once("value");
  if (!snapshot.exists()) return [];

  const data = snapshot.val();
  const results = [];

  for (const k of Object.keys(data)) {
    const entry = data[k];
    if (entry.timestamp) {
      const ts = new Date(entry.timestamp);
      if (ts >= startDate && ts <= endDate) {
        results.push({
          timestamp: ts,
          temp: entry.temp ?? '',
          ir: entry.ir ?? ''
        });
      }
    }
  }

  results.sort((a, b) => a.timestamp - b.timestamp);
  return results;
}

// -------------------- CSV --------------------
function downloadCSV(rows, filename) {
  if (!rows.length) {
    alert("No data found.");
    return;
  }
  const header = ["Date", "Time", "Temperature", "IR"];
  const lines = [header.join(",")];

  for (const r of rows) {
    const d = r.timestamp;
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    lines.push([csvEscape(date), csvEscape(time), csvEscape(r.temp), csvEscape(r.ir)].join(","));
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// -------------------- UI --------------------
document.getElementById("download-csv").addEventListener("click", async () => {
  const startStr = document.getElementById("start-date").value;
  const endStr = document.getElementById("end-date").value;

  if (!startStr || !endStr) {
    alert("Please select both dates.");
    return;
  }

  const start = dateFromInputStr(startStr, false);
  const end = dateFromInputStr(endStr, true);

  const rows = await fetchSensorData(start, end);

  // Preview
  const preview = document.getElementById("preview");
  if (!rows.length) {
    preview.innerHTML = "<p>No data found in range.</p>";
  } else {
    let html = "<table><thead><tr><th>Date</th><th>Time</th><th>Temp</th><th>IR</th></tr></thead><tbody>";
    rows.slice(0, 20).forEach(r => {
      const d = r.timestamp;
      const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      html += `<tr><td>${date}</td><td>${time}</td><td>${r.temp}</td><td>${r.ir}</td></tr>`;
    });
    html += "</tbody></table>";
    preview.innerHTML = html;
  }

  downloadCSV(rows, `sensor_${startStr}_to_${endStr}.csv`);
});
