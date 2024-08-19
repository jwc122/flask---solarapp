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
  
    let tableHTML = "<table>";
  
    tableHTML += "<tr>";
    tableHTML += "<th>Month</th>";
    tableHTML += "<th>E_d (Wh/d)</th>";
    tableHTML += "<th>E_lost_d (Wh/d)</th>";
    tableHTML += "<th>f_f (%)</th>";
    tableHTML += "<th>f_e (%)</th>";
    tableHTML += "</tr>";
  
    for (let i = 0; i < rows.length; i += 5) {
      const monthIndex = parseInt(rows[i], 10) - 1;
  
      if (monthIndex >= 0 && monthIndex < 12) {
        const monthName = monthNames[monthIndex];
        const E_d = rows[i + 1];
        const E_lost_d = rows[i + 2];
        const f_f = rows[i + 3];
        const f_e = rows[i + 4];
  
        tableHTML += `<tr>`;
        tableHTML += `<td>${monthName}</td>`;
        tableHTML += `<td>${E_d}</td>`;
        tableHTML += `<td>${E_lost_d}</td>`;
        tableHTML += `<td>${f_f}</td>`;
        tableHTML += `<td>${f_e}</td>`;
        tableHTML += `</tr>`;
      }
    }
  
    tableHTML += "</table>";
  
    const explanationText = `
      <p><strong>E_d:</strong> Average energy production per day (Wh/d)</p>
      <p><strong>E_lost_d:</strong> Average energy not captured per day (Wh/d)</p>
      <p><strong>f_f:</strong> Percentage of days when the battery became full (%)</p>
      <p><strong>f_e:</strong> Percentage of days when the battery became empty (%)</p>
    `;
  
    responseDiv.innerHTML = tableHTML + explanationText;
  }
  
  document.getElementById('submitButton').addEventListener('click', callApi);
  
  const hiddenInputs = `
    <input type="hidden" id="peakpower" value="">
    <input type="hidden" id="batterysize" value="">
  `;
  document.body.insertAdjacentHTML('beforeend', hiddenInputs);
  