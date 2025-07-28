import os
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Read API key from environment
API_KEY = os.getenv("TICKETMASTER_API_KEY")

if not API_KEY:
    raise ValueError("TICKETMASTER_API_KEY is not set in your .env file.")

@app.route('/')
def home():
    return "CityPulse API is running! Use /search?city=Austin to test."

@app.route('/search')
def search():
    city = request.args.get('city', '').strip()

    if not city:
        return jsonify({"error": "Missing 'city' parameter"}), 400

    url = "https://app.ticketmaster.com/discovery/v2/events.json"
    params = {
        "apikey": API_KEY,
        "city": city,
        "size": 10,
        "sort": "date,asc"
    }

    try:
        res = requests.get(url, params=params)
        res.raise_for_status()
        data = res.json()
    except requests.RequestException as e:
        return jsonify({"error": "Failed to connect to Ticketmaster", "details": str(e)}), 500

    events = []

    if "_embedded" in data:
        for e in data["_embedded"]["events"]:
            try:
                venue = e["_embedded"]["venues"][0]
                events.append({
                    "name": e["name"],
                    "url": e["url"],
                    "datetime": e["dates"]["start"].get("dateTime", "TBD"),
                    "venue": venue.get("name", "Unknown"),
                    "lat": float(venue["location"]["latitude"]),
                    "lng": float(venue["location"]["longitude"])
                })
            except (KeyError, IndexError, ValueError) as parse_error:
                print(f"Skipping event due to parse error: {parse_error}")
                continue

    return jsonify(events)

@app.route('/search/geo')
def geo_search():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    radius = request.args.get('radius', '10')
    unit = request.args.get('unit', 'miles')

    if not lat or not lon:
        return jsonify({"error": "Both 'lat' and 'lon' parameters are required"}), 400
    
    try:

        float(lat)
        float(lon)
    except ValueError:
        return jsonify({"error": "Invalid latitude or longitude format"}), 400

    latlong = f"{lat},{lon}"
    
    url = "https://app.ticketmaster.com/discovery/v2/events.json"
    params = {
        "apikey": API_KEY,
        "latlong": latlong,
        "radius": radius,
        "unit": unit,
        "size": 10,
        "sort": "date,asc"
    }

    try:
        res = requests.get(url, params=params)
        res.raise_for_status()
        data = res.json()
    except requests.RequestException as e:
        return jsonify({"error": "Failed to connect to Ticketmaster", "details": str(e)}), 500

    events = []

    if "_embedded" in data and "events" in data["_embedded"]:
        for e in data["_embedded"]["events"]:
            try:
                venue = e["_embedded"]["venues"][0]
                events.append({
                    "name": e["name"],
                    "url": e["url"],
                    "datetime": e["dates"]["start"].get("dateTime", "TBD"),
                    "venue": venue.get("name", "Unknown"),
                    "lat": float(venue["location"]["latitude"]) if "location" in venue and "latitude" in venue["location"] else None,
                    "lng": float(venue["location"]["longitude"]) if "location" in venue and "longitude" in venue["location"] else None,
                    "distance": e.get("distance")
                })
            except (KeyError, IndexError, ValueError) as parse_error:
                print(f"Skipping event due to parse error: {parse_error}")
                continue

    return jsonify(events)

if __name__ == '__main__':
    print("Starting Flask CityPulse app")
    app.run(debug=True)
