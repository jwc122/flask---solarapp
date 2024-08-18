function updateApiValues(systemId) {
    const checkbox1 = document.getElementById("selectSystem1");
    const checkbox2 = document.getElementById("selectSystem2");

    // Reset hidden inputs before updating
    document.getElementById("peakpower").value = "";
    document.getElementById("batterysize").value = "";

    if (systemId === 1 && checkbox1.checked) {
        checkbox2.checked = false;
        document.getElementById("peakpower").value = "3000";
        document.getElementById("batterysize").value = "5000";
    } else if (systemId === 2 && checkbox2.checked) {
        checkbox1.checked = false;
        document.getElementById("peakpower").value = "3500";
        document.getElementById("batterysize").value = "5120";
    }
}

function callApi() {
    // Clear previous responses
    document.getElementById("pvgisResponse").innerHTML = '';

    // Retrieve all values from form elements
    const countyCoordinates = document.getElementById("county").value;
    const [lat, lon] = countyCoordinates.split(',');
    const peakpower = document.getElementById("peakpower").value;
    const angle = document.getElementById("angle").value;
    const azimuth = document.getElementById("azimuth").value.trim();
    const batterysize = document.getElementById("batterysize").value;
    const consumptionday = document.getElementById("consumptionday").value.trim();
    const cutoff = document.getElementById("cutoff").value.trim();

    // Validate required fields
    if (!lat || !lon || !peakpower || !angle || !batterysize || !azimuth || !consumptionday || !cutoff) {
        document.getElementById("pvgisResponse").innerText = 'Please fill in all required fields.';
        return;
    }

    // Prepare data to be sent to the server
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

    // Log the postData to ensure it's correct
    console.log("Sending Data:", postData);

    fetch('/fetch_pvgis_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            document.getElementById("pvgisResponse").innerText = data.error;
        } else {
            displayRelevantData(data.data);
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        document.getElementById("pvgisResponse").innerText = 'Error fetching data. Please try again.';
    });
}

function displayRelevantData(data) {
    const responseDiv = document.getElementById("pvgisResponse");

    // Mapping of numbers to month names
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];

    // Split the data string by spaces or tabs (assuming the data is separated by whitespace)
    const rows = data.trim().split(/\s+/);

    // Arrays to hold data for charts
    const months = [];
    const edData = [];
    const elostdData = [];
    const ffData = [];
    const feData = [];

    // Prepare the HTML for the table
    let tableHTML = "<table>";

    // Create the header row
    tableHTML += "<tr>";
    tableHTML += "<th>Month</th>";
    tableHTML += "<th>E_d (Wh/d)</th>";
    tableHTML += "<th>E_lost_d (Wh/d)</th>";
    tableHTML += "<th>f_f (%)</th>";
    tableHTML += "<th>f_e (%)</th>";
    tableHTML += "</tr>";

    // Now loop through the data and insert it into the table
    for (let i = 0; i < rows.length; i += 5) {
        const monthIndex = parseInt(rows[i], 10) - 1; // Convert to zero-based index for the month

        // Check if the monthIndex is valid (i.e., between 0 and 11 inclusive)
        if (monthIndex >= 0 && monthIndex < 12) {
            const monthName = monthNames[monthIndex];
            const E_d = parseFloat(rows[i + 1]);
            const E_lost_d = parseFloat(rows[i + 2]);
            const f_f = parseFloat(rows[i + 3]);
            const f_e = parseFloat(rows[i + 4]);

            // Populate chart data arrays
            months.push(monthName);
            edData.push(E_d);
            elostdData.push(E_lost_d);
            ffData.push(f_f);
            feData.push(f_e);

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

    // Adding the explanation text below the table
    const explanationText = `
        <p><strong>E_d:</strong> Average energy production per day (Wh/d)</p>
        <p><strong>E_lost_d:</strong> Average energy not captured per day (Wh/d)</p>
        <p><strong>f_f:</strong> Percentage of days when the battery became full (%)</p>
        <p><strong>f_e:</strong> Percentage of days when the battery became empty (%)</p>
    `;

    // Set the innerHTML of the responseDiv to the new table and explanation
    responseDiv.innerHTML = tableHTML + explanationText;

    // Generate the combined charts
    createCombinedChart('chartEdElostd', 'E_d (Wh/d) vs E_lost_d (Wh/d)', months, edData, elostdData, 'E_d (Wh/d)', 'E_lost_d (Wh/d)');
    createCombinedChart('chartFfFe', 'f_f (%) vs f_e (%)', months, ffData, feData, 'f_f (%)', 'f_e (%)');
}

function createCombinedChart(chartId, label, labels, data1, data2, label1, label2) {
    const ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: label1,
                    data: data1,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: label2,
                    data: data2,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Add event listener to submit button
document.getElementById('submitButton').addEventListener('click', callApi);

// Hidden inputs to hold values from table
const hiddenInputs = `
    <input type="hidden" id="peakpower" value="">
    <input type="hidden" id="batterysize" value="">
`;
document.body.insertAdjacentHTML('beforeend', hiddenInputs);
