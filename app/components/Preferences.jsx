import React, { useState } from "react";

const images = [
  "https://cdn.glitch.com/894b4ea2-a9a7-4f2f-94e6-bd6d31041cf5%2Fw0b1.png?1588272809816",
  "https://cdn.glitch.com/894b4ea2-a9a7-4f2f-94e6-bd6d31041cf5%2Fw1b0.png?1588272809624",
  "https://cdn.glitch.com/894b4ea2-a9a7-4f2f-94e6-bd6d31041cf5%2Fw2b3.png?1588272809717",
  "https://cdn.glitch.com/894b4ea2-a9a7-4f2f-94e6-bd6d31041cf5%2Fw3b2.png?1588272809761"
];

export default function Preferences({ setPreferences }) {
  const [iAmWhite, setIAmWhite] = useState(
    localStorage.getItem("iAmWhite") === null ||
      JSON.parse(localStorage.getItem("iAmWhite"))
  );
  const o = JSON.parse(localStorage.getItem("boardOrientation") || "0");
  const [boardOrientation, setBoardOrientation] = useState(
    o
  );

  function handleColorClick(w) {
    localStorage.setItem("iAmWhite", w);
    setIAmWhite(w);
  }

  function handleOrientationClick(o) {
    localStorage.setItem("boardOrientation", o);
    setBoardOrientation(o);
  }

  return (
    <div className="preferences">
      <h1>Preferences</h1>
      <div>
        <h2>Choose your color</h2>
        <div className="color-row">
          <div onClick={() => handleColorClick(true)} className={`white circle ${iAmWhite ? 'selected' : ''}`}/>
          <div onClick={() => handleColorClick(false)} className={`black circle ${!iAmWhite ? 'selected' : ''}`}/>
        </div>
      </div>
      <div className="orientation">
        <h2>Choose board orientation:</h2>
        <div className="row">
          <img
            src={images[iAmWhite ? 0 : 1]}
            className={`${boardOrientation === 0 ? "selected" : ""}`}
            onClick={() => handleOrientationClick(0)}
          />
          <img
            src={images[iAmWhite ? 2 : 3]}
            className={`${boardOrientation === 2 ? "selected" : ""}`}
            onClick={() => handleOrientationClick(2)}
          />
        </div>
        <div className="row">
          <img
            src={images[iAmWhite ? 1 : 0]}
            className={`${boardOrientation === 1 ? "selected" : ""}`}
            onClick={() => handleOrientationClick(1)}
          />
          <img
            src={images[iAmWhite ? 3 : 2]}
            className={`${boardOrientation === 3 ? "selected" : ""}`}
            onClick={() => handleOrientationClick(3)}
          />
        </div>
      </div>
      <div>
        <button onClick={() => setPreferences(false)}>OK</button>
      </div>
    </div>
  );
}
``;
