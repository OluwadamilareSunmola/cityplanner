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
                <option value="">All Types</option>
                <option value="Music">Music</option>
                <option value="Sports">Sports</option>
                <option value="Arts & Theater">Arts & Theatre</option>
                <option value="Miscellaneous">Miscellaneous</option>
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
              <option value="">All Genres</option>
              <option value="Rock">Rock</option>
              <option value="Pop">Pop</option>
              <option value="Hip-Hop/Rap">Hip-Hop/Rap</option>
              <option value="Classical">Classical</option>
              <option value="Comedy">Comedy</option>
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
                <option value="">All Times</option>
                <option value="thisWeek">This Week</option>
                <option value="month">This Month</option>
                <option value="sixMonths">Next 6 Months</option>
                <option value="year">Next Year</option>
              </select>
            </div>
          </form>
        </div>
    </>
}