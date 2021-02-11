import React from "react";
import "./App.css";
import LunarCalendar from "./LunarCalendar";
import Moon from "./Moon";
import Dumplings from "./Dumplings";

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