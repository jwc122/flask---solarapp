from flask import Flask, url_for, render_template, request, jsonify
from werkzeug.middleware.proxy_fix import ProxyFix

import requests

app = Flask(__name__)

# Flask is behind a proxy since we are using nginx.
# app.wsgi_app = ProxyFix(
#     app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1
# )

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/fetch_pvgis_data', methods=['POST'])
def fetch_pvgis_data():
    data = request.json
    lat = data.get('lat')
    lon = data.get('lon')
    peakpower = data.get('peakpower')
    angle = data.get('angle')
    azimuth = data.get('aspect')
    batterysize = data.get('batterysize')
    consumptionday = data.get('consumptionday')
    cutoff = data.get('cutoff')

    # Call the PVGIS API with the appropriate parameters
    pvgis_api_url = f"https://re.jrc.ec.europa.eu/api/SHScalc?lat={lat}&lon={lon}&peakpower={peakpower}&batterysize={batterysize}&consumptionday={consumptionday}&cutoff={cutoff}&angle={angle}&aspect={azimuth}"


    response = requests.get(pvgis_api_url)

    if response.status_code == 200:
        response_text = response.text
        relevant_data = extract_relevant_data(response_text)
        if relevant_data:
            return jsonify({'data': relevant_data})
        else:
            return jsonify({'error': 'No relevant data found.'}), 404
    else:
        return jsonify({'error': 'Error fetching data from PVGIS API.'}), response.status_code

def extract_relevant_data(response_text):
    # Assuming the relevant data is in a JSON format
    start_index = response_text.find('month')
    end_index = response_text.find('E_d: Average energy production per day (Wh/d)')

    if start_index != -1 and end_index != -1:
        relevant_section = response_text[start_index:end_index].strip()
        return relevant_section
    return None

if __name__ == '__main__':
    app.run()