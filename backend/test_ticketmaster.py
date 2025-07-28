import pytest
from ticketmaster import app
from unittest.mock import patch, Mock

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def mock_ticketmaster_response(events=True):
    return {
        "_embedded": {
            "events": [
                {
                    "name": "Concert A",
                    "url": "https://example.com/eventA",
                    "dates": {"start": {"dateTime": "2025-08-01T20:00:00Z"}},
                    "_embedded": {
                        "venues": [
                            {
                                "name": "Stadium X",
                                "location": {"latitude": "40.7128", "longitude": "-74.0060"}
                            }
                        ]
                    },
                    "distance": 3.5
                }
            ]
        }
    } if events else {}

@patch('app.requests.get')
def test_search_city_success(mock_get, client):
    mock_response = Mock()
    mock_response.json.return_value = mock_ticketmaster_response()
    mock_response.raise_for_status = Mock()
    mock_get.return_value = mock_response

    response = client.get('/search?city=Austin')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert data[0]['name'] == "Concert A"

@patch('app.requests.get')
def test_search_geo_success(mock_get, client):
    mock_response = Mock()
    mock_response.json.return_value = mock_ticketmaster_response()
    mock_response.raise_for_status = Mock()
    mock_get.return_value = mock_response

    response = client.get('/search/geo?lat=40.7128&lon=-74.0060&radius=10&unit=miles')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert data[0]['venue'] == "Stadium X"

def test_search_missing_city(client):
    response = client.get('/search')
    assert response.status_code == 400
    assert "Missing 'city'" in response.get_json()['error']

def test_search_geo_invalid_coords(client):
    response = client.get('/search/geo?lat=abc&lon=xyz')
    assert response.status_code == 400
    assert "Invalid latitude or longitude format" in response.get_json()['error']

def test_search_geo_missing_coords(client):
    response = client.get('/search/geo')
    assert response.status_code == 400
    assert "Both 'lat' and 'lon'" in response.get_json()['error']
