// main.jsx
import React from "react";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
// import routes from "./routes";

ReactDOM.createRoot(document.getElementById("root")).render(
	<StrictMode>
		<App />
	</StrictMode>
); // Changed from routes to App component
/* Change made here to import App component */
// <BrowserRouter>
//   <Routes>
//     {routes.map((route, index) => (
//       <Route key={index} path={route.path} element={route.element} />
//     ))}
//   </Routes>
// </BrowserRouter>
