import unittest
from unittest.mock import patch, Mock
import geoapify as geo

class TestCityExplorer(unittest.TestCase):
    def setUp(self):
        self.api_key = "test_api_key"
        self.explorer = geo.CityExplorer(self.api_key)
        
        self.ticketmaster_event = {
            "_embedded": {
                "venues": [{
                    "name": "Madison Square Garden",
                    "location": {
                        "latitude": "40.7505",
                        "longitude": "-73.9934"
                    },
                    "address": {
                        "line1": "4 Pennsylvania Plaza"
                    },
                    "id": "KovZpZAJledA"
                }]
            }
        }
        
        venue = self.ticketmaster_event.get('_embedded', {}).get('venues', [{}])[0]
        location = venue.get('location', {})
        
        self.event_location = geo.EventLocation(
            name=venue.get('name', 'Unknown Venue'),
            lat=float(location.get('latitude', 0)),
            lon=float(location.get('longitude', 0)),
            address=venue.get('address', {}).get('line1', ''),
            venue_id=venue.get('id', '')
        )
    
    @patch('geoapify.requests.get')
    def test_api_404_error(self, mock_get):
        mock_response = Mock()
        mock_response.status_code = 404
        mock_response.raise_for_status.side_effect = Exception("404 Not Found")
        mock_get.return_value = mock_response
        
        results = self.explorer.search_places_near_event(self.event_location, 'restaurants')
        
        self.assertEqual(len(results), 0)
        mock_get.assert_called_once()
    
    @patch('geoapify.requests.get')
    def test_empty_api_response(self, mock_get):
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {'features': []}
        mock_get.return_value = mock_response
        
        results = self.explorer.search_places_near_event(self.event_location, 'restaurants')
        
        self.assertEqual(len(results), 0)
        mock_get.assert_called_once()
    
    def test_ticketmaster_venue_extraction(self):
        # tests that ticketmaster venue was extracted and initialized properly
        self.assertEqual(self.event_location.name, "Madison Square Garden")
        self.assertEqual(self.event_location.lat, 40.7505)
        self.assertEqual(self.event_location.lon, -73.9934)
        self.assertEqual(self.event_location.address, "4 Pennsylvania Plaza")
        self.assertEqual(self.event_location.venue_id, "KovZpZAJledA")
     
    @patch('geoapify.requests.get')
    def test_multiple_search_categories(self, mock_get):
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {
            'features': [
                {
                    'properties': {
                        'place_id': 'place_789',
                        'name': 'Test Place',
                        'categories': ['catering.restaurant'],
                        'formatted': '789 Broadway, New York, NY',
                        'distance': 300
                    },
                    'geometry': {
                        'coordinates': [-73.9920, 40.7495]
                    }
                }
            ]
        }
        mock_get.return_value = mock_response
        
        geojson_data = self.explorer.get_geojson_data(self.event_location)
        
        # confirms categories and total places exists in geojson data
        self.assertIn('categories', geojson_data['properties'])
        self.assertIn('total_places', geojson_data['properties'])
    
if __name__ == '__main__':
    unittest.main()