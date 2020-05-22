import React, { useContext } from "react";
import {AppContext} from '../app';

export default function Waiting() {
  const { appState: {app}, dispatch } = useContext(AppContext);
  return (
    <>
      <h1>Waiting for {app.invitee.username}'s response</h1>
      <button
        onClick={() =>
          dispatch({ type: "cancel invitation", payload: app.invitee })
        }
      >
        Cancel
      </button>
    </>
  );
}
