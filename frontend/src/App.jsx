// import React from "react";
// import EventListPage from "./pages/participant/EventListPage";
// import EventDetails from "./pages/participant/EventDetailsPage";

// const App = () => {
//   return (
//     <>
//       {/* <EventListPage /> */}
//       <EventDetails />
//     </>
//   );
// };

// export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/participant/HomePage";
import EventListPage from "./pages/participant/EventListPage";
import EventForm from "./pages/organizer/CreateEventPage";
import EventDetailsPage from "./pages/participant/EventDetailsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/categories/:name" element={<EventListPage />} />
        <Route path="/createevent" element={<EventForm />} />
        <Route path="events/:id" element={<EventDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
