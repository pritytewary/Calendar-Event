import React, { useState, useEffect, useContext, createContext } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";

const EventContext = createContext();

const useEvents = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const storedEvents = localStorage.getItem("events");
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

  const addEvent = (event) => {
    const newEvents = [...events, { ...event, id: Date.now() }];
    setEvents(newEvents);
    localStorage.setItem("events", JSON.stringify(newEvents));
  };

  const editEvent = (id, updatedEvent) => {
    const newEvents = events.map((event) =>
      event.id === id ? { ...event, ...updatedEvent } : event
    );
    setEvents(newEvents);
    localStorage.setItem("events", JSON.stringify(newEvents));
  };

  const deleteEvent = (id) => {
    const newEvents = events.filter((event) => event.id !== id);
    setEvents(newEvents);
    localStorage.setItem("events", JSON.stringify(newEvents));
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
    <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <div className="space-x-2">
          <button
            onClick={prevMonth}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition duration-300"
          >
            <ChevronLeft className="text-purple-600" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition duration-300"
          >
            <ChevronRight className="text-purple-600" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-bold text-white">
            {day}
          </div>
        ))}
        {[
          ...Array(firstDayOfMonth).fill(null),
          ...Array(daysInMonth).keys(),
        ].map((day, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg ${
              day !== null
                ? "bg-white bg-opacity-20 cursor-pointer hover:bg-opacity-30 transition duration-300"
                : ""
            }`}
            onClick={() =>
              day !== null &&
              setSelectedDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  day + 2
                )
              )
            }
          >
            {day !== null && (
              <>
                <div className="text-white font-semibold">{day + 1}</div>
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
                      className="text-xs bg-white text-purple-600 rounded-full px-2 py-1 mt-1 truncate"
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
        <EventForm
          date={selectedDate.toISOString().split("T")[0]}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
};

const EventForm = ({ event, date, onClose }) => {
  const { addEvent, editEvent } = useContext(EventContext);
  const [title, setTitle] = useState(event ? event.title : "");
  const [eventDate, setEventDate] = useState(event ? event.date : date);
  const [category, setCategory] = useState(event ? event.category : "Work");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (event) {
      editEvent(event.id, { title, date: eventDate, category });
    } else {
      addEvent({ title, date: eventDate, category });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-purple-600">
          {event ? "Edit Event" : "Add Event"}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event Title"
            className="w-full p-3 mb-4 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full p-3 mb-4 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 mb-4 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
          </select>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-300"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EventList = () => {
  const { events, deleteEvent } = useContext(EventContext);
  const [filter, setFilter] = useState("All");
  const [editingEvent, setEditingEvent] = useState(null);

  const filteredEvents =
    filter === "All"
      ? events
      : events.filter((event) => event.category === filter);

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-purple-600">Events</h2>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full p-3 mb-4 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="All">All</option>
        <option value="Work">Work</option>
        <option value="Personal">Personal</option>
      </select>
      {filteredEvents.map((event) => (
        <div
          key={event.id}
          className="flex justify-between items-center p-4 mb-2 border-b border-purple-100 hover:bg-purple-50 transition duration-300"
        >
          <div>
            <h3 className="font-bold text-purple-600">{event.title}</h3>
            <p className="text-sm text-gray-600">
              {new Date(event.date).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">{event.category}</p>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => setEditingEvent(event)}
              className="p-2 text-blue-500 hover:text-blue-600"
            >
              <Edit />
            </button>
            <button
              onClick={() => deleteEvent(event.id)}
              className="p-2 text-red-500 hover:text-red-600"
            >
              <Trash2 />
            </button>
          </div>
        </div>
      ))}
      {editingEvent && (
        <EventForm
          event={editingEvent}
          date={editingEvent.date}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </div>
  );
};

const App = () => {
  const eventHook = useEvents();

  return (
    <EventContext.Provider value={eventHook}>
      <Router>
        <div className="min-h-screen bg-gray-100 py-8">
          <div className="container mx-auto px-4">
            <nav className="mb-8">
              <ul className="flex space-x-4 justify-center">
                <li>
                  <Link
                    to="/"
                    className="text-purple-600 hover:text-purple-800 font-semibold text-lg"
                  >
                    Calendar
                  </Link>
                </li>
                <li>
                  <Link
                    to="/events"
                    className="text-purple-600 hover:text-purple-800 font-semibold text-lg"
                  >
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
        </div>
      </Router>
    </EventContext.Provider>
  );
};

export default App;
