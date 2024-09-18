
# Solar Energy and Battery Performance Calculator

## Overview

This project is a web application that allows users to calculate solar energy production and battery performance based on user inputs. It integrates the **PVGIS API** to fetch solar data, and displays the results using **Chart.js**. 

### Features:
- Select location, solar panel angle, and battery type.
- Display energy production and lost energy for each month.
- Dynamically update charts with data from the PVGIS API.
  
## Structure

### HTML (`index.html`):
- **Form Inputs**: 
  - Select a county for location coordinates.
  - Choose the angle and azimuth for solar panels.
  - Enter consumption per day.
  - Pick from a list of solar systems with pre-configured values for battery size and peak power.
- **Checkbox Table**: Two tables listing system configurations, including battery type (AGM or Lithium) and capacity. Users can select only one system at a time.

### CSS (`style.css`):
- Defines layout styles for the form, buttons, and table.
- Includes styles for responsiveness, ensuring the form and chart display side-by-side on larger screens.
- Themed with transparency effects for buttons, form containers, and charts.

### JavaScript (`script.js`):
- **`updateApiValues(systemId)`**: Updates battery size and peak power when a system is selected, allowing only one system to be selected at a time.
- **`callApi()`**: 
  - Collects form data and system configuration.
  - Automatically sets the cutoff value based on battery type (AGM or Lithium).
  - Sends a POST request to the backend to fetch solar data from the PVGIS API.
- **`displayRelevantData(data)`**: Processes and displays the API response in a chart. Includes functionality to toggle between energy data (`E_d`, `E_lost_d`) and performance factors (`f_f`, `f_e`).

### Backend (`server.py`):
- Handles the POST request from the frontend, processes the data, and makes the request to the PVGIS API. It returns the data to be displayed on the frontend.

## How to Run
1. Clone the repository.
2. Set up a Python environment and install required dependencies (e.g., Flask for backend).
3. Start the backend server using `python server.py`.
4. Open `index.html` in a browser to interact with the form and view the results.

## Dependencies
- **Flask**: For handling backend requests.
- **Chart.js**: For rendering dynamic charts.
- **PVGIS API**: For fetching solar energy data.
  
## Future Improvements
- Might need to update more furture systems with different configurations.


## License
This project is open-source and available under the MIT License?
