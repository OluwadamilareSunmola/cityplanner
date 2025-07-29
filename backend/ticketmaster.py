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
TICKETMASTER_API_KEY = os.getenv("TICKETMASTER_API_KEY")
GEOAPIFY_API_KEY = os.getenv("GEOAPIFY_API_KEY")

city_explorer = geo.CityExplorer(GEOAPIFY_API_KEY)

@app.route('/')
def home():
    return "CityPulse API is running! Use /search?city=Austin to test."

@app.route('/events')
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
                    "lng": float(venue["location"]["longitude"]),
                    "segment": event.get("genre", {}).get("segment", "Unknown"),
                    "genre": event.get("genre", {}).get("name", "Unknown")
                })
            except (KeyError, IndexError, ValueError) as parse_error:
                print(f"Skipping event due to parse error: {parse_error}")
                continue

    return jsonify(events)

@app.route('/places')
def get_places():
    """Get places near an event location"""
    try:
        # get parameters
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        event_name = request.args.get('event_name', 'Event Location')
        address = request.args.get('address', '')
        search_types = request.args.getlist('types') or ['restaurants', 'bars', 'entertainment']
        radius = request.args.get('radius', 1000, type=int)
        limit = request.args.get('limit', 10, type=int)

        if not lat or not lng:
            return jsonify({"error": "Missing lat/lng parameters"}), 400

        # create event location object
        event_location = {
            'name': event_name,
            'lat': lat,
            'lon': lng,
            'address': address
        }

        # get GeoJSON data
        geojson_data = city_explorer.get_geojson_data(
            event_location=event_location,
            search_types=search_types,
            radius=radius,
            limit_per_category=limit
        )

        return jsonify(geojson_data)

    except Exception as e:
        return jsonify({"error": "Failed to fetch places", "details": str(e)}), 500

@app.route('/event-with-places')
def get_event_with_places():
    # Get a specific event with nearby places data
    try:
        # get event details from frontend
        event_id = request.args.get('event_id')
        event_name = request.args.get('event_name', 'Event')
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        address = request.args.get('address', '')
        venue = request.args.get('venue', '')
        datetime = request.args.get('datetime', '')
        url = request.args.get('url', '')
        
        # optional parameters
        search_types = request.args.getlist('types') or ['restaurants', 'bars', 'entertainment', 'attractions']
        radius = request.args.get('radius', 1500, type=int)
        limit = request.args.get('limit', 15, type=int)

        if not lat or not lng:
            return jsonify({"error": "Missing lat/lng parameters"}), 400

        # create event location object for geoapify
        event_location = {
            'name': event_name,
            'lat': lat,
            'lon': lng,
            'address': address
        }

        # get places around the event
        geojson_data = city_explorer.get_geojson_data(
            event_location=event_location,
            search_types=search_types,
            radius=radius,
            limit_per_category=limit
        )

        # return both event data and places data
        response_data = {
            "event": {
                "id": event_id,
                "name": event_name,
                "lat": lat,
                "lng": lng,
                "address": address,
                "venue": venue,
                "datetime": datetime,
                "url": url
            },
            "places_data": geojson_data,
            "search_params": {
                "types": search_types,
                "radius": radius,
                "limit_per_category": limit
            }
        }

        return jsonify(response_data)

    except Exception as e:
        return jsonify({"error": "Failed to fetch event with places", "details": str(e)}), 500

@app.route('/event-map-data')
def get_event_map_data():
    # get both event and surrounding places data for map
    try:
        event_id = request.args.get('event_id')
        city = request.args.get('city')
        
        if not city:
            return jsonify({"error": "Missing city parameter"}), 400

        events_response = get_events()
        if events_response[1] != 200: 
            return events_response

        events_data = events_response[0].get_json()
        events = events_data.get('events', [])

        if not events:
            return jsonify({"error": "No events found"}), 404

        # if specific event_id provided, find that event
        if event_id:
            selected_event = next((e for e in events if e['id'] == event_id), events[0])
        else:
            selected_event = events[0]

        # get places around the selected event
        event_location = {
            'name': selected_event['name'],
            'lat': selected_event['lat'],
            'lon': selected_event['lng'],
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

if __name__ == '__main__':
     print("Starting Flask CityPulse app")
     app.run(debug=True)