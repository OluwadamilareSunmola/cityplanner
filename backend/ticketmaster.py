import os
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS

import geoapify as geo

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Read API key from environment
API_KEY = os.getenv("TICKETMASTER_API_KEY")
GEOAPIFY_API_KEY = os.getenv("GEOAPIFY_API_KEY")

if not API_KEY:
    raise ValueError("TICKETMASTER_API_KEY is not set in your .env file.")

city_explorer = geo.CityExplorer(GEOAPIFY_API_KEY)

@app.route('/')
def home():
    return "CityPulse API is running! Use /search?city=Austin to test."

# 
@app.route('/api/events')
def get_events():
    """Get events from Ticketmaster API"""
    city = request.args.get('city', '').strip()
    size = request.args.get('size', 10, type=int)

    if not city:
        return jsonify({"error": "Missing 'city' parameter"}), 400

    url = "https://app.ticketmaster.com/discovery/v2/events.json"
    params = {
        "apikey": TICKETMASTER_API_KEY,
        "city": city,
        "size": size,
        "sort": "date,asc"
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        return jsonify({"error": "Failed to connect to Ticketmaster", "details": str(e)}), 500

    events = []
    if "_embedded" in data:
        for event in data["_embedded"]["events"]:
            try:
                venue = event["_embedded"]["venues"][0]
                events.append({
                    "id": event["id"],
                    "name": event["name"],
                    "url": event["url"],
                    "datetime": event["dates"]["start"].get("dateTime", "TBD"),
                    "venue": venue.get("name", "Unknown"),
                    "address": venue.get("address", {}).get("line1", ""),
                    "city": venue.get("city", {}).get("name", ""),
                    "lat": float(venue["location"]["latitude"]),
                    "lng": float(venue["location"]["longitude"])
                })
            except (KeyError, IndexError, ValueError) as parse_error:
                print(f"⚠️ Skipping event due to parse error: {parse_error}")
                continue

    return jsonify({"events": events, "total": len(events)})

@app.route('/api/places')
def get_places():
    """Get places near an event location"""
    try:
        # Get parameters
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        event_name = request.args.get('event_name', 'Event Location')
        address = request.args.get('address', '')
        search_types = request.args.getlist('types') or ['restaurants', 'bars', 'entertainment']
        radius = request.args.get('radius', 1000, type=int)
        limit = request.args.get('limit', 10, type=int)

        if not lat or not lng:
            return jsonify({"error": "Missing lat/lng parameters"}), 400

        # Create event location object
        event_location = {
            'name': event_name,
            'lat': lat,
            'lng': lng,
            'address': address
        }

        # Get GeoJSON data
        geojson_data = city_explorer.get_geojson_data(
            event_location=event_location,
            search_types=search_types,
            radius=radius,
            limit_per_category=limit
        )

        return jsonify(geojson_data)

    except Exception as e:
        return jsonify({"error": "Failed to fetch places", "details": str(e)}), 500

@app.route('/event-map-data')
def get_event_map_data():
    # Get both event and surrounding places data for map
    try:
        event_id = request.args.get('event_id')
        city = request.args.get('city')
        
        if not city:
            return jsonify({"error": "Missing city parameter"}), 400

        # First get events
        events_response = get_events()
        if events_response[1] != 200:  # Check status code
            return events_response

        events_data = events_response[0].get_json()
        events = events_data.get('events', [])

        if not events:
            return jsonify({"error": "No events found"}), 404

        # If specific event_id provided, find that event
        if event_id:
            selected_event = next((e for e in events if e['id'] == event_id), events[0])
        else:
            selected_event = events[0]

        # Get places around the selected event
        event_location = {
            'name': selected_event['name'],
            'lat': selected_event['lat'],
            'lng': selected_event['lng'],
            'address': selected_event['address']
        }

        geojson_data = city_explorer.get_geojson_data(
            event_location=event_location,
            search_types=['restaurants', 'bars', 'entertainment', 'attractions'],
            radius=1500,
            limit_per_category=15
        )

        return jsonify({
            "event": selected_event,
            "map_data": geojson_data,
            "all_events": events
        })

    except Exception as e:
        return jsonify({"error": "Failed to fetch event map data", "details": str(e)}), 500
    
# 

#@app.route('/search')
# def search():
#     city = request.args.get('city', '').strip()

#     if not city:
#         return jsonify({"error": "Missing 'city' parameter"}), 400

#     url = "https://app.ticketmaster.com/discovery/v2/events.json"
#     params = {
#         "apikey": API_KEY,
#         "city": city,
#         "size": 10,
#         "sort": "date,asc"
#     }

#     try:
#         res = requests.get(url, params=params)
#         res.raise_for_status()
#         data = res.json()
#     except requests.RequestException as e:
#         return jsonify({"error": "Failed to connect to Ticketmaster", "details": str(e)}), 500

#     events = []

#     if "_embedded" in data:
#         for e in data["_embedded"]["events"]:
#             try:
#                 venue = e["_embedded"]["venues"][0]
#                 events.append({
#                 "name": e.get("name", "Unknown"),
#                 "url": e.get("url", None),
#                 "datetime": e.get("dates", {}).get("start", {}).get("dateTime", "TBD"),
#                 "venue": venue.get("name", "Unknown"),
#                 "lat": float(venue.get("location", {}).get("latitude", 0.0)) if "location" in venue and "latitude" in venue["location"] else None,
#                 "lng": float(venue.get("location", {}).get("longitude", 0.0)) if "location" in venue and "longitude" in venue["location"] else None,
#                 "distance": e.get("distance")
#             })

#             except (KeyError, IndexError, ValueError) as parse_error:
#                 print(f"Skipping event due to parse error: {parse_error}")
#                 continue

#     return jsonify(events)@app.route('/search/geo')
# def geo_search():
#     lat = request.args.get('lat')
#     lon = request.args.get('lon')
#     radius = request.args.get('radius', '10')
#     unit = request.args.get('unit', 'miles')

#     if not lat or not lon:
#         return jsonify({"error": "Both 'lat' and 'lon' parameters are required"}), 400
    
#     try:

#         float(lat)
#         float(lon)
#     except ValueError:
#         return jsonify({"error": "Invalid latitude or longitude format"}), 400

#     latlong = f"{lat},{lon}"
    
#     url = "https://app.ticketmaster.com/discovery/v2/events.json"
#     params = {
#         "apikey": API_KEY,
#         "latlong": latlong,
#         "radius": radius,
#         "unit": unit,
#         "size": 50,
#         "sort": "date,asc"
#     }

#     try:
#         res = requests.get(url, params=params)
#         res.raise_for_status()
#         data = res.json()
#     except requests.RequestException as e:
#         return jsonify({"error": "Failed to connect to Ticketmaster", "details": str(e)}), 500

#     events = []

#     if "_embedded" in data and "events" in data["_embedded"]:
#         for e in data["_embedded"]["events"]:
#             try:
#                 venue = e["_embedded"]["venues"][0]
#                 events.append({
#                 "name": e.get("name", "Unknown"),
#                 "url": e.get("url", None),
#                 "datetime": e.get("dates", {}).get("start", {}).get("dateTime", "TBD"),
#                 "venue": venue.get("name", "Unknown"),
#                 "lat": float(venue.get("location", {}).get("latitude", 0.0)) if "location" in venue and "latitude" in venue["location"] else None,
#                 "lng": float(venue.get("location", {}).get("longitude", 0.0)) if "location" in venue and "longitude" in venue["location"] else None,
#                 "distance": e.get("distance")
#             })

#             except (KeyError, IndexError, ValueError) as parse_error:
#                 print(f"Skipping event due to parse error: {parse_error}")
#                 continue

#     return jsonify(events)

# if __name__ == '__main__':
#     print("Starting Flask CityPulse app")
#     app.run(debug=True)
