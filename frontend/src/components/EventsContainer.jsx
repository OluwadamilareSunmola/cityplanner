export default function EventsContainer({ filteredEvents, children }) {
    const buttonClass = "w-17 h-9 text-md font-bold rounded-lg cursor-pointer duration-200";

    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp);

        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return <>
        <div>
            <div className="info mt-93 md:mt-83 w-[1050px] mb-3\2">
            {filteredEvents.length === 0 ? (
                <p>No events found.</p>
            ) : (
                filteredEvents.map(([id, event]) => (
                    <div key={id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm w-[300px] md:w-[400px] lg:w-[700px] mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 px-3">{event.name}</h3>
                        
                        <p className="text-gray-600 mb-6 px-3 py-2">
                            {event.description || "No description provided."}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Location</div>
                                    <div className="text-sm text-gray-900">{event.location}</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Time</div>
                                    <div className="text-sm text-gray-900">{formatDateTime(event.time)}</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Type</div>
                                    <div className="text-sm text-gray-900 uppercase">{event.type}</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Genre</div>
                                    <div className="text-sm text-gray-900 uppercase">{event.genre}</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md md:col-span-2">
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Address</div>
                                    <div className="text-sm text-gray-900">{event.address}</div>
                                </div>
                            </div>
                        </div>
                        <div>
                            {children(id, event, buttonClass)}
                        </div>
                    </div>
                ))
            )}
            </div>
        </div>
    </>
}