export default function EventsContainer({ filteredEvents, children }) {
      const buttonClass = "w-17 h-9 text-md font-bold rounded-lg cursor-pointer duration-200";

    return <>
        <div className="info mt-83">
          {filteredEvents.length === 0 ? (
            <p>No events found.</p>
          ) : (
            filteredEvents.map(([id, event]) => (
              <div key={id} className="event-block">
                <h3>{event.name}</h3>
                <p>
                  <strong>Description:</strong> {event.description}
                </p>
                <ul>
                  <p>
                    <strong>Location:</strong> {event.location}
                  </p>
                  <p>
                    <strong>Type:</strong> {event.type}
                  </p>
                  <p>
                    <strong>Genre:</strong> {event.genre}
                  </p>
                  <p>
                    <strong>Time:</strong> {event.time}
                  </p>
                  <p>
                    <strong>Address:</strong> {event.address}
                  </p>
                </ul>
                {children(id, event, buttonClass)}
              </div>
            ))
          )}
        </div>
    </>
}