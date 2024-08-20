import React, { useState, useEffect, useContext, createContext } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, X } from "lucide-react";

const EventContext = createContext();

const useEvents = () => {
  const [events, setEvents] = useState([]);

  const addEvent = (event) => {
    setEvents([...events, { ...event, id: Date.now() }]);
  };

  const editEvent = (id, updatedEvent) => {
    setEvents(
      events.map((event) =>
        event.id === id ? { ...event, ...updatedEvent } : event
      )
    );
  };

  const deleteEvent = (id) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  return { events, addEvent, editEvent, deleteEvent };
};

const Calendar = () => {
  const { events } = useContext(EventContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <div>
          <button onClick={prevMonth} className="p-2">
            <ChevronLeft />
          </button>
          <button onClick={nextMonth} className="p-2">
            <ChevronRight />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-bold">
            {day}
          </div>
        ))}
        {[
          ...Array(firstDayOfMonth).fill(null),
          ...Array(daysInMonth).keys(),
        ].map((day, index) => (
          <div
            key={index}
            className={`p-2 border ${
              day !== null ? "cursor-pointer hover:bg-gray-100" : ""
            }`}
            onClick={() =>
              day !== null &&
              setSelectedDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  day + 1
                )
              )
            }
          >
            {day !== null && (
              <>
                <div>{day + 1}</div>
                {events
                  .filter((event) => {
                    const eventDate = new Date(event.date);
                    return (
                      eventDate.getDate() === day + 1 &&
                      eventDate.getMonth() === currentDate.getMonth() &&
                      eventDate.getFullYear() === currentDate.getFullYear()
                    );
                  })
                  .map((event) => (
                    <div
                      key={event.id}
                      className="text-xs bg-blue-200 rounded p-1 mt-1"
                    >
                      {event.title}
                    </div>
                  ))}
              </>
            )}
          </div>
        ))}
      </div>
      {selectedDate && (
        <EventForm date={selectedDate} onClose={() => setSelectedDate(null)} />
      )}
    </div>
  );
};

// Event form component
const EventForm = ({ event, onClose }) => {
  const { addEvent, editEvent } = useContext(EventContext);
  const [title, setTitle] = useState(event ? event.title : "");
  const [date, setDate] = useState(
    event ? event.date : new Date().toISOString().split("T")[0]
  );
  const [category, setCategory] = useState(event ? event.category : "Work");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (event) {
      editEvent(event.id, { title, date, category });
    } else {
      addEvent({ title, date, category });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">
          {event ? "Edit Event" : "Add Event"}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event Title"
            className="w-full p-2 mb-2 border rounded"
            required
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
            required
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          >
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
          </select>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 mr-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Event list component
const EventList = () => {
  const { events, deleteEvent } = useContext(EventContext);
  const [filter, setFilter] = useState("All");
  const [editingEvent, setEditingEvent] = useState(null);

  const filteredEvents =
    filter === "All"
      ? events
      : events.filter((event) => event.category === filter);

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-2">Events</h2>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      >
        <option value="All">All</option>
        <option value="Work">Work</option>
        <option value="Personal">Personal</option>
      </select>
      {filteredEvents.map((event) => (
        <div
          key={event.id}
          className="flex justify-between items-center p-2 border-b"
        >
          <div>
            <h3 className="font-bold">{event.title}</h3>
            <p>{new Date(event.date).toLocaleDateString()}</p>
            <p>{event.category}</p>
          </div>
          <div>
            <button onClick={() => setEditingEvent(event)} className="p-2">
              <Edit />
            </button>
            <button onClick={() => deleteEvent(event.id)} className="p-2">
              <Trash2 />
            </button>
          </div>
        </div>
      ))}
      {editingEvent && (
        <EventForm event={editingEvent} onClose={() => setEditingEvent(null)} />
      )}
    </div>
  );
};

// Main App component
const App = () => {
  const eventHook = useEvents();

  return (
    <EventContext.Provider value={eventHook}>
      <Router>
        <div className="container mx-auto p-4">
          <nav className="mb-4">
            <ul className="flex space-x-4">
              <li>
                <Link to="/" className="text-blue-500 hover:underline">
                  Calendar
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-blue-500 hover:underline">
                  Events
                </Link>
              </li>
            </ul>
          </nav>
          <Routes>
            <Route path="/" element={<Calendar />} />
            <Route path="/events" element={<EventList />} />
          </Routes>
        </div>
      </Router>
    </EventContext.Provider>
  );
};

export default App;
