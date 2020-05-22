import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../app";

export default function NewGameButton() {
  const [isPressed, setIsPressed] = useState({
    end: false,
    this: false,
    game: false
  });
  
  const { appState: { game }, dispatch } = useContext(AppContext);

  useEffect(() => {
    if (isPressed.end && isPressed.this && isPressed.game) {
      game.socket.emit('end game', { inviter: game.inviter, invitee: game.invitee });
      dispatch({ type: 'game ended' }); // yuck
    }
  }, [isPressed]);
  
  function onClick(name) {
    const s = setIsPressed(s => ({ ...s, [name]: !s[name] }));
  }
  return (
    <div id="newgamebutton-container">
      <button
        onClick={() => onClick('end')}
        className={`${isPressed.end ? "armed" : ""}`}
      >
        End
      </button>
      <button
        onClick={() => onClick('this')}
        className={`${isPressed.this ? "armed" : ""}`}
      >
        This
      </button>
      <button
        onClick={() => onClick('game')}
        className={`${isPressed.game ? "armed" : ""}`}
      >
        Game
      </button>
    </div>
  );
}
