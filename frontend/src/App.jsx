import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/participant/HomePage";
import EventListPage from "./pages/participant/EventListPage";
import EventForm from "./pages/organizer/CreateEventPage";
import EventDetailsPage from "./pages/participant/EventDetailsPage";
import OpenPage from "./pages/participant/OpenPage";
import AuthFormRegister from "./components/ui/AuthFormRegister";
import AuthFormRegisterConnection from "./components/ui/AuthFormConnection";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<OpenPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/categories/:name" element={<EventListPage />} />
        <Route path="/createevent" element={<EventForm />} />
        <Route path="events/:id" element={<EventDetailsPage />} />
        <Route path="register" element={<AuthFormRegister />} />
        <Route path="login" element={<AuthFormRegisterConnection />} />
      </Routes>
    </Router>
  );
}

export default App;
