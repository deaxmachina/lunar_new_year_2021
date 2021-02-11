import React from "react";
import "./App.css";
import LunarCalendar from "./LunarCalendar";
import Moon from "./Moon";

// Note: background sky from tutorial: https://www.youtube.com/watch?v=0t6Dmp70kTw Carla Notarobot
// Lunar calendar based on Mike Bostock: https://observablehq.com/@mbostock/phases-of-the-moon

const App = () => {
  return (
    <>
    <div className="stars"></div>
    <div className="twinkling"></div>
    <div className="clouds"></div>

      <Moon />
      <LunarCalendar />


    </>
  )
};

export default App;