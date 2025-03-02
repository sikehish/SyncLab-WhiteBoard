import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Whiteboard from "./Whiteboard";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/room/:roomId" element={<Whiteboard />} />
      </Routes>
    </Router>
  );
};

export default App;
