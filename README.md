# CityPulse  
CityPulse is an interactive website that allows users discover local events through an interactive map using real-time data through TicketMaster and Geoapify.  

## Features
- Interactive Map: Visual event discovery with clickable pins and popups with details  
- Real-time Data: Live event infromation from TicketMaster's API
- Smart Filtering: Search by location, genre, and date  
- Event Bookmarking: Save your favorite events for later  

## Tech Stack
### Backend 
- Flask: Used Python for backend logic and API's  
- TicketMaster API: Used to look up events depending on the search criteria given by user  
- Geoapify: Looks up nearby restaurants, stores, and attractions close to the TicketMaster event  
### Frontend
- React: Used to create web pages
- Leaflet: Interactive maps with markers
- Bootstrap CSS: Styling and components

## Getting Started
To run the backend:  
1. Clone repository and open up a terminal  
2. Install all requirements using `pip install -r requirements.txt` 
3. Create a .env file by copying the .env.example file  
4. Get API keys for TicketMaster, Geoapify, and MapTiler and paste them into the .env file  
5. Change into backend directory using `cd backend`  
6. Run `python ticketmaster.py` to start the Flask server  

To run the frontend:  
1. Change into frontend using `cd frontend`  
2. Install all packages using  `npm install`  
3. Start the website using `npm run dev`  




