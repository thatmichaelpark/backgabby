import React, { useContext } from "react";
import {AppContext} from '../app';

export default function Invitation() {
  const { appState: {app}, dispatch } = useContext(AppContext);
  return (
    <>
      <h1>{app.inviter.username} wants to play</h1>
      <button
        onClick={() =>
          dispatch({ type: "accept invitation", payload: app.inviter })
        }
      >
        Let's play!
      </button>
    </>
  );
}
