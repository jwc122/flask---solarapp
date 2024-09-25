function updateApiValues(systemId) {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');

  // Uncheck other systems if this system is selected
  checkboxes.forEach((checkbox) => {
    if (checkbox.id !== `selectSystem${systemId}`) {
      checkbox.checked = false;
    }
  });

  // Define battery and peak power values for all 15 systems
  const systemConfig = {
    1: { battery: "5100", peakpower: "3000" },
    2: { battery: "3000", peakpower: "1000" },
    3: { battery: "4200", peakpower: "4000" },
    4: { battery: "6000", peakpower: "6000" },
    5: { battery: "7000", peakpower: "6000" },
    6: { battery: "8000", peakpower: "7000" },
    7: { battery: "9000", peakpower: "8000" },
    8: { battery: "4200", peakpower: "4000" },
    9: { battery: "7000", peakpower: "6000" },
    10: { battery: "8000", peakpower: "7000" },
    11: { battery: "9000", peakpower: "8000" },
    12: { battery: "10000", peakpower: "9000" },
    13: { battery: "11000", peakpower: "10000" },
    14: { battery: "12000", peakpower: "11000" },
    15: { battery: "13000", peakpower: "12000" }
  };

  // Update the battery size and peak power based on the selected system
  if (systemConfig[systemId]) {
    document.getElementById("batterysize").value = systemConfig[systemId].battery;
    document.getElementById("peakpower").value = systemConfig[systemId].peakpower;
  } else {
    console.error('System ID not found or configured:', systemId);
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

  // Retrieve the selected battery type
  const selectedSystem = document.querySelector('input[type="checkbox"]:checked');
  const batteryType = selectedSystem.closest('tr').querySelector('td:nth-child(2)').textContent.trim();

  // Automatically assign the correct cutoff value based on battery type
  let cutoff;
  if (batteryType === 'AGM') {
    cutoff = 20;
  } else if (batteryType === 'Lithium') {
    cutoff = 5;
  }

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

  console.log("Sending the following data to the API:", postData);

  fetch('/fetch_pvgis_data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.error) {
        document.getElementById("pvgisResponse").innerText = `Error from PVGIS API: ${data.error}`;
      } else {
        displayRelevantData(data.data);
        // Set the initial button text to "View Battery Statistics" since E_d is shown first
        document.getElementById("changeButton").innerText = 'View Battery Statistics';
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      document.getElementById("pvgisResponse").innerText = `Error fetching data: ${error.message}. Please ensure that the API endpoint is reachable and the input parameters are valid.`;
    });
}



function displayRelevantData(data) {
  const responseDiv = document.getElementById("pvgisResponse");
  const monthNames = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];

  const rows = data.trim().split(/\s+/);

  const usableEnergyValues = []; // Replaces E_d values
  const batteryFullValues = []; // Replaces f_f values
  const batteryEmptyValues = []; // Replaces f_e values
  const months = [];

  for (let i = 0; i < rows.length; i += 5) {
    const monthIndex = parseInt(rows[i], 10) - 1;

    if (monthIndex >= 0 && monthIndex < 12) {
      const monthName = monthNames[monthIndex];
      const usableEnergy = parseFloat(rows[i + 1]); // Usable energy (was E_d)
      const batteryFull = parseFloat(rows[i + 3]); // Battery Full (was f_f)
      const batteryEmpty = parseFloat(rows[i + 4]); // Battery Empty (was f_e)

      months.push(monthName);
      usableEnergyValues.push(usableEnergy);
      batteryFullValues.push(batteryFull);
      batteryEmptyValues.push(batteryEmpty);
    }
  }

  responseDiv.innerHTML = `
    <button id="changeButton">View Battery Statistics</button>
    <canvas id="chartCanvas" width="400" height="200"></canvas>
  `;

  const ctx = document.getElementById('chartCanvas').getContext('2d');

  let isShowingUsableEnergy = true; // Track the current state of the graph

  let currentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Usable Energy (Wh/d)', // Initial view is Usable Energy
          data: usableEnergyValues,
          backgroundColor: 'rgba(255, 149, 0, 0.5)'
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

  document.getElementById('changeButton').addEventListener('click', () => {
    currentChart.destroy();

    if (isShowingUsableEnergy) {
      // Switch to Battery Full and Battery Empty graph
      currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Battery Full (%)',
              data: batteryFullValues,
              backgroundColor: 'rgba(255, 149, 0, 0.5)'
            },
            {
              label: 'Battery Empty (%)',
              data: batteryEmptyValues,
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
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

      // Update button text
      document.getElementById("changeButton").innerText = 'View Usable Energy';
      isShowingUsableEnergy = false;
    } else {
      // Switch back to Usable Energy graph
      currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Usable Energy (Wh/d)',
              data: usableEnergyValues,
              backgroundColor: 'rgba(255, 149, 0, 0.5)'
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

      // Update button text
      document.getElementById("changeButton").innerText = 'View Battery Statistics';
      isShowingUsableEnergy = true;
    }
  });
}





document.getElementById('submitButton').addEventListener('click', callApi);

const hiddenInputs = `
<input type="hidden" id="peakpower" value="">
<input type="hidden" id="batterysize" value="">
`;
document.body.insertAdjacentHTML('beforeend', hiddenInputs);

const script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/chart.js";
document.head.appendChild(script);
