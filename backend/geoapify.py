import requests
import json
from typing import List, Dict, Tuple, Optional, Union
from dataclasses import dataclass


# format for ticketmaster event
@dataclass
class EventLocation:
    name: str
    lat: float
    lon: float
    address: str = ""
    venue_id: str = ""

# format for geoapify place response
@dataclass
class PlaceResult:
    id: str
    name: str
    category: str
    subcategory: str
    lat: float
    lon: float
    address: str
    distance: int
    rating: Optional[float] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    opening_hours: Optional[Dict] = None
    description: Optional[str] = None

class CityExplorer:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.geoapify.com/v2/places"

        self.category_mappings = {
            'restaurants': ['catering.restaurant', 'catering.fast_food'],
            'bars': ['catering.bar', 'catering.pub', 'adult.nightclub'],
            'cafes': ['catering.cafe', 'catering.ice_cream'],
            'entertainment': ['entertainment.cinema', 'entertainment.culture', 'entertainment.amusement_arcade'],
            'attractions': ['tourism.attraction', 'tourism.sights'],
            'shopping': ['commercial.shopping_mall', 'commercial.marketplace', 'commercial.department_store'],
            'all_dining': ['catering.restaurant', 'catering.bar', 'catering.cafe', 'catering.pub', 'catering.fast_food']
        }
    
    def search_places_near_event(self, event_location: Union[EventLocation, Dict],
                                search_type: str = 'all_dining',radius: int = 1000,
                                limit: int = 50) -> List[PlaceResult]:
        # extract coordinates
        if isinstance(event_location, dict):
            lat = event_location.get('lat') or event_location.get('latitude')
            lon = event_location.get('lon') or event_location.get('longitude')
            if lat is None or lon is None:
                raise ValueError("Event location must contain lat/lon coordinates")
        else:
            lat = event_location.lat
            lon = event_location.lon
            
        categories = self.category_mappings.get(search_type, self.category_mappings['all_dining'])
        
        response = self._make_api_request(lat, lon, categories, radius, limit)
        return self._parse_api_response(response)
    
    def get_geojson_data(self,
                        event_location: Union[EventLocation, Dict],
                        search_types: List[str] = None,
                        radius: int = 1000,
                        limit_per_category: int = 10) -> Dict:
        """
        get data formatted as GeoJSON

        event_location: event location from Ticketmaster API
        search_types: list of category types to search for
        radius: search radius in meters
        limit_per_category: max results per category
            
        returns geojson with locations
        """
        if search_types is None:
            search_types = ['restaurants', 'bars', 'entertainment', 'attractions','shopping']
            
        event_lat = event_location.get('lat') or event_location.get('latitude') if isinstance(event_location, dict) else event_location.lat
        event_lon = event_location.get('lon') or event_location.get('longitude') if isinstance(event_location, dict) else event_location.lon
        
        features = []
        category_counts = {}
        
        # add the venue from ticketmaster as the first feature
        event_feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [event_lon, event_lat] 
            },
            "properties": {
                "id": "event_location",
                "name": event_location.get('name', 'Event Location') if isinstance(event_location, dict) else event_location.name,
                "address": event_location.get('address', '') if isinstance(event_location, dict) else event_location.address,
                "type": "event",
                "category": "event",
                "marker_color": "red",
                "marker_icon": "star",
                "marker_size": "large"
            }
        }
        features.append(event_feature)
        
        # search for places in each category
        for category in search_types:
            try:
                places = self.search_places_near_event(
                    event_location, category, radius, limit_per_category
                )
                category_counts[category] = len(places)
                
                # add each place as a feature
                for place in places:
                    place_feature = {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [place.lon, place.lat]  # [lng, lat] for GeoJSON
                        },
                        "properties": {
                            "id": place.id,
                            "name": place.name,
                            "category": place.category,
                            "subcategory": place.subcategory,
                            "address": place.address,
                            "distance": place.distance,
                            "rating": place.rating,
                            "phone": place.phone,
                            "website": place.website,
                            "opening_hours": place.opening_hours,
                            "description": place.description,
                            "marker_color": self._get_marker_color(place.category),
                            "marker_icon": self._get_marker_icon(place.category),
                            "marker_size": "medium"
                        }
                    }
                    features.append(place_feature)
                    
            except Exception as e:
                print(f"Error searching for {category}: {e}")
                category_counts[category] = 0
        
        # create the GeoJSON feature collection
        geojson = {
            "type": "FeatureCollection",
            "features": features,
            "properties": {
                "center": [event_lon, event_lat],  # [lng, lat]
                "radius": radius,
                "categories": category_counts,
                "bounds": self._calculate_bounds(event_lat, event_lon, radius),
                "total_places": len(features) - 1  # Subtract 1 for event marker
            }
        }
        
        return geojson
    
    def _make_api_request(self, lat: float, lon: float, categories: List[str], radius: int, limit: int) -> Dict:
        categories_str = ','.join(categories)
        
        params = {
            'categories': categories_str,
            'filter': f'circle:{lon},{lat},{radius}',
            'bias': f'proximity:{lon},{lat}',
            'limit': limit,
            'apiKey': self.api_key,
            'format': 'geojson'
        }
        
        try:
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error making API request: {e}")
            return {'features': []}
    
    def _parse_api_response(self, response: Dict) -> List[PlaceResult]:
        # turns api response into place result
        places = []
        
        for feature in response.get('features', []):
            props = feature.get('properties', {})
            coords = feature.get('geometry', {}).get('coordinates', [])
            
            if len(coords) < 2:
                continue
                
            # extract category info
            categories = props.get('categories', ['unknown'])
            main_category = categories[0] if categories else 'unknown'
            subcategory = categories[1] if len(categories) > 1 else main_category
            
            place = PlaceResult(
                id=props.get('place_id', f"{coords[1]}_{coords[0]}"),
                name=props.get('name', 'Unknown'),
                category=main_category,
                subcategory=subcategory,
                lat=coords[1], 
                lon=coords[0],  
                address=props.get('formatted', ''),
                distance=int(props.get('distance', 0)),
                rating=self._extract_rating(props),
                phone=props.get('contact', {}).get('phone'),
                website=props.get('contact', {}).get('website'),
                opening_hours=props.get('opening_hours'),
                description=props.get('description')
            )
            places.append(place)
            
        return sorted(places, key=lambda x: x.distance)
    
    def _extract_rating(self, props: Dict) -> Optional[float]:
        rating_sources = [
            props.get('datasource', {}).get('raw', {}).get('rating'),
            props.get('rating'),
            props.get('datasource', {}).get('raw', {}).get('stars')
        ]
        
        for rating in rating_sources:
            if rating is not None:
                try:
                    return float(rating)
                except (ValueError, TypeError):
                    continue
        return None
    
    def _get_marker_color(self, category: str) -> str:
        # map markers based on category
        color_map = {
            'catering.restaurant': 'green',
            'catering.bar': 'purple',
            'catering.pub': 'purple',
            'catering.cafe': 'orange',
            'catering.fast_food': 'lightgreen',
            'entertainment': 'blue',
            'tourism.attraction': 'red',
            'commercial': 'gray'
        }
        
        for key, color in color_map.items():
            if key in category:
                return color
        return 'gray'
    
    def _get_marker_icon(self, category: str) -> str:
        # returns marker color based on category
        icon_map = {
            'catering.restaurant': 'cutlery',
            'catering.bar': 'glass',
            'catering.pub': 'beer',
            'catering.cafe': 'coffee',
            'catering.fast_food': 'cutlery',
            'entertainment': 'music',
            'tourism.attraction': 'camera',
            'commercial': 'shopping-cart'
        }
        
        for key, icon in icon_map.items():
            if key in category:
                return icon
        return 'map-marker'
    
    def _calculate_bounds(self, center_lat: float, center_lon: float, radius: int) -> Dict:
        # 1 degree is about 111km
        lat_offset = (radius / 111000)
        lon_offset = (radius / 111000) / abs(center_lat / 90) if center_lat != 0 else (radius / 111000)
        
        return {
            'north': center_lat + lat_offset,
            'south': center_lat - lat_offset,
            'east': center_lon + lon_offset,
            'west': center_lon - lon_offset
        }
