export default function SearchSection({ filters, setFilters, title, subtitle }) {
    return <>
        <div className="filter-section mb-10">
          <h2 className="title text-4xl">{title}</h2>
          <div className="text-1xl font-bold pb-6 text-gray-800 text-center">
            {subtitle.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
            ))}
          </div>
          <input
            className="w-140 h-9 rounded-sm mb-4"
            type="text"
            placeholder="Search..."
            value={filters.text}
            onChange={(e) => setFilters({ ...filters, text: e.target.value })}
          />
          <form
            className="event-filter-form flex-row flex"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex flex-col items-center mx-7">
              <label className="text-md" htmlFor="event-type">Type</label>
              <select
                className="w-40 h-6 rounded-sm mb-4"
                id="event-type"
                name="type"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">-- Select Type --</option>
                <option value="music">Music</option>
                <option value="sports">Sports</option>
                <option value="theater">Theater</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex flex-col items-center mx-7">
            <label className="text-md" htmlFor="genre">Genre</label>
            <select
              className="w-40 h-6 rounded-sm mb-4"
              id="genre"
              name="genre"
              value={filters.genre}
              onChange={(e) =>
                setFilters({ ...filters, genre: e.target.value })
              }
            >
              <option value="">-- Select Genre --</option>
              <option value="rock">Rock</option>
              <option value="hiphop">Hip-Hop</option>
              <option value="classical">Classical</option>
              <option value="comedy">Comedy</option>
            </select>
            </div>

            <div className="flex flex-col items-center mx-7">
              <label className="text-md" htmlFor="time-range">When</label>
              <select
                className="w-40 h-6 rounded-sm mb-4"
                id="time-range"
                name="time"
                value={filters.time}
                onChange={(e) => setFilters({ ...filters, time: e.target.value })}
              >
                <option value="">-- Select Time Range --</option>
                <option value="month">This Month</option>
                <option value="6months">Next 6 Months</option>
                <option value="year">Next Year</option>
              </select>
            </div>
          </form>
        </div>
    </>
}