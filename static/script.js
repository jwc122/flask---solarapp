function updateApiValues(systemId) {
  const checkbox1 = document.getElementById("selectSystem1");
  const checkbox2 = document.getElementById("selectSystem2");

  if (systemId === 1) {
    if (checkbox1.checked) {
      checkbox2.checked = false;
      document.getElementById("peakpower").value = "3000";
      document.getElementById("batterysize").value = "5000";
    } else {
      document.getElementById("peakpower").value = "";
      document.getElementById("batterysize").value = "";
    }
  } else if (systemId === 2) {
    if (checkbox2.checked) {
      checkbox1.checked = false;
      document.getElementById("peakpower").value = "3500";
      document.getElementById("batterysize").value = "5120";
    } else {
      document.getElementById("peakpower").value = "";
      document.getElementById("batterysize").value = "";
    }
  }
}

function callApi() {
  const countyCoordinates = document.getElementById("county").value;
  const [lat, lon] = countyCoordinates.split(',');
  const peakpower = document.getElementById("peakpower").value;
  const angle = document.getElementById("angle").value;
  const azimuth = document.getElementById("azimuth").value;
  const batterysize = document.getElementById("batterysize").value;
  const consumptionday = document.getElementById("consumptionday").value;
  const cutoff = document.getElementById("cutoff").value;

  const postData = {
    lat: lat,
    lon: lon,
    peakpower: peakpower,
    angle: angle,
    aspect: azimuth,
    batterysize: batterysize,
    consumptionday: consumptionday,
    cutoff: cutoff
  };

  fetch('/fetch_pvgis_data', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      document.getElementById("pvgisResponse").innerText = data.error;
    } else {
      displayRelevantData(data.data);
    }
  })
  .catch(error => {
    console.error('Error fetching data:', error);
    document.getElementById("pvgisResponse").innerText = 'Error fetching data.';
  });
}

function displayRelevantData(data) {
  const responseDiv = document.getElementById("pvgisResponse");

  const monthNames = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];

  const rows = data.trim().split(/\s+/);

  // Arrays to store the values for the charts
  const E_d_values = [];
  const E_lost_d_values = [];
  const f_f_values = [];
  const f_e_values = [];
  const months = [];

  for (let i = 0; i < rows.length; i += 5) {
    const monthIndex = parseInt(rows[i], 10) - 1;

    if (monthIndex >= 0 && monthIndex < 12) {
      const monthName = monthNames[monthIndex];
      const E_d = parseFloat(rows[i + 1]);
      const E_lost_d = parseFloat(rows[i + 2]);
      const f_f = parseFloat(rows[i + 3]);
      const f_e = parseFloat(rows[i + 4]);

      months.push(monthName);
      E_d_values.push(E_d);
      E_lost_d_values.push(E_lost_d);
      f_f_values.push(f_f);
      f_e_values.push(f_e);
    }
  }

  // Clear any previous content and set up the charts container
  responseDiv.innerHTML = `
    <button id="changeButton">Change</button>
    <canvas id="chartCanvas" width="400" height="200"></canvas>
  `;

  const ctx = document.getElementById('chartCanvas').getContext('2d');

  // Initialize with the first chart (E_d and E_lost_d)
  let currentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: 'E_d (Wh/d)',
          data: E_d_values,
          backgroundColor: 'rgba(54, 162, 235, 0.5)'
        },
        {
          label: 'E_lost_d (Wh/d)',
          data: E_lost_d_values,
          backgroundColor: 'rgba(255, 99, 132, 0.5)'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Add functionality to the Change button to switch charts
  document.getElementById('changeButton').addEventListener('click', () => {
    currentChart.destroy();  // Destroy the current chart

    // Toggle between the two charts
    if (currentChart.config.data.datasets[0].label === 'E_d (Wh/d)') {
      // Switch to the f_f and f_e chart
      currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: 'f_f (%)',
              data: f_f_values,
              backgroundColor: 'rgba(75, 192, 192, 0.5)'
            },
            {
              label: 'f_e (%)',
              data: f_e_values,
              backgroundColor: 'rgba(153, 102, 255, 0.5)'
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    } else {
      // Switch back to the E_d and E_lost_d chart
      currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: 'E_d (Wh/d)',
              data: E_d_values,
              backgroundColor: 'rgba(54, 162, 235, 0.5)'
            },
            {
              label: 'E_lost_d (Wh/d)',
              data: E_lost_d_values,
              backgroundColor: 'rgba(255, 99, 132, 0.5)'
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  });
}

document.getElementById('submitButton').addEventListener('click', callApi);

const hiddenInputs = `
<input type="hidden" id="peakpower" value="">
<input type="hidden" id="batterysize" value="">
`;
document.body.insertAdjacentHTML('beforeend', hiddenInputs);

// Load Chart.js library
const script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/chart.js";
document.head.appendChild(script);
