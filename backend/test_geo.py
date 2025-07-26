import geoapify as geo
import json
from dotenv import load_dotenv
import os


load_dotenv()

# get geoapify api key
geoapify_api_key = os.getenv("GEOAPIFY_API_KEY")

# initialize explorer class
explorer = geo.CityExplorer(geoapify_api_key)

# sample expected ticketmaster response
ticketmaster_event = {
    "_embedded": {
        "venues": [{
            "name": "Madison Square Garden",
            "location": {
                "latitude": "40.7505",
                "longitude": "-73.9934"
            },
            "address": {
                "line1": "4 Pennsylvania Plaza"
            }
        }]
    }
}

venue = ticketmaster_event.get('_embedded', {}).get('venues', [{}])[0]
location = venue.get('location', {})

# extract location
event_location = geo.EventLocation(name=venue.get('name', 'Unknown Venue'),
            lat=float(location.get('latitude', 0)),
            lon=float(location.get('longitude', 0)),
            address=venue.get('address', {}).get('line1', ''),
            venue_id=venue.get('id', ''))

geojson_data = explorer.get_geojson_data(event_location)

print(json.dumps(geojson_data, indent=2))