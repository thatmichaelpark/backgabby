import React, { useContext, useState } from "react";
import { AppContext } from "../app";
import Login from "./Login";
import InvitationReceived from "./InvitationReceived";
import InvitationSent from "./InvitationSent";
import Game from "./Game";
import Preferences from "./Preferences";
import Gabby from './Gabby';

export default function Main() {
  const { appState: {app}, dispatch } = useContext(AppContext);
  const [preferences, setPreferences] = useState(false);
  
  if (app.isPlaying) {
    return (
      <Game
        inviter={app.inviter}
        invitee={app.invitee}
        isInviter={app.inviter.id === app.user.id}
        socket={app.socketRef.current}
      />
    );
  }

  const sortedUsers = app.users
    .filter(user => user.socketId && app.socketRef.current && user.socketId !== app.socketRef.current.id)
    .sort((a, b) =>
      a.username < b.username ? -1 : a.username > b.username ? 1 : 0
  );
  
  if (app.user && !app.user.socketId) {
    return (
      <>
        <h1>DISCONNECTED!</h1>
        <h1>Please wait</h1>
      </>
    );
  }
  
  return (
    <>
      {!app.isLoggedIn ? <Login />
      : app.isInviting ? <InvitationSent />
      : app.isInvited ? <InvitationReceived />
      : preferences ? (
        <Preferences setPreferences={setPreferences}/>
      ) : (
        <>
          <div>
            {app.user.username}
            <button onClick={() => dispatch({ type: "log out" })}>Log out</button>
            <button onClick={() => setPreferences(true)}>Preferences</button>
          </div>
          <h1>Users</h1>
          <ul>
            {sortedUsers.length ? (
              sortedUsers.map(user => (
                <li
                  key={user.userId}
                >
                  <button onClick={() => dispatch({ type: "invite", payload: user })}>Invite {user.username} to play</button>
                </li>
              ))
            ) : (
              <li>No one else is logged in</li>
            )}
          </ul>
        </>
      )}
      <Gabby/>
    </>
  );
}
