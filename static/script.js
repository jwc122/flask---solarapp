function updateApiValues(systemId) {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');

  // Uncheck other systems if this system is selected
  checkboxes.forEach((checkbox) => {
    if (checkbox.id !== `selectSystem${systemId}`) {
      checkbox.checked = false;
    }
  });

  const batteryValue = document.getElementById(`batterySwitch${systemId}`) ? 
      document.getElementById(`batterySwitch${systemId}`).innerText : "";

  if (batteryValue) {
    document.getElementById("batterysize").value = batteryValue; // Make sure battery size is correctly set
  }
  
  if (systemId === 9) { // Off-Grid Hybrid
    document.getElementById("peakpower").value = "11000"; // Set Off-Grid Hybrid peak power
  } else if (systemId === 1) {
    document.getElementById("peakpower").value = "3000"; // Example for another system
  }
  // Add logic for other systems if necessary
}


function toggleBattery(spanId, value1, value2) {
  const span = document.getElementById(spanId);
  const newValue = span.innerText === value1 ? value2 : value1;
  
  // Update the displayed value
  span.innerText = newValue;

  // Update the hidden input field for battery size
  document.getElementById("batterysize").value = newValue;
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
          backgroundColor: 'rgba(255, 149, 0, 0.5)'  // 50% transparent FF9500
        },
        {
          label: 'E_lost_d (Wh/d)',
          data: E_lost_d_values,
          backgroundColor: 'rgba(0, 0, 0, 0.5)'  // 50% transparent black
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
              backgroundColor: 'rgba(255, 149, 0, 0.5)'  // 50% transparent FF9500
            },
            {
              label: 'f_e (%)',
              data: f_e_values,
              backgroundColor: 'rgba(0, 0, 0, 0.5)'  // 50% transparent black
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
              backgroundColor: 'rgba(255, 149, 0, 0.5)'  // 50% transparent FF9500
            },
            {
              label: 'E_lost_d (Wh/d)',
              data: E_lost_d_values,
              backgroundColor: 'rgba(0, 0, 0, 0.5)'  // 50% transparent black
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
