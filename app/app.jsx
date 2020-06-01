import React, { useEffect, useReducer, useRef, useState } from "react";
import ReactDOM from "react-dom";
import Main from "./components/Main";
import Toasts from './components/Toasts';
import {appReducer, gameReducer, toastReducer} from './reducers';

export const AppContext = React.createContext();

function reducer(prevState, action) {
  return {
    app: appReducer(prevState.app, action),
    game: gameReducer(prevState.game, action),
    toast: toastReducer(prevState.toast, action)
  };
}

function App() {
  const [appState, dispatch] = useReducer(reducer, {
    app: {
      isLoggedIn: false,
      isInviting: false,
      isInvited: false,
      isPlaying: false,
      socketRef: useRef(),
      user: {},
      users: []
    },
    game: {
      checkers: [],
      piles: [],
      dice: [],
      selectedCheckerId: -1,
      zOrder: [],
      undoBuffer: []
    },
    toast: {
      nextId: 0,
      toasts: []
    }
  });
  const context = {
    appState: appState,
    dispatch
  };
  useEffect(() => {
    const socket = window.io();
    dispatch({ type: "set socket", payload: socket });
    socket.on("login succeeded", (user) => {
      dispatch({ type: "login succeeded", payload: user });
    });
    socket.on("login failed", () => {
      console.log("fail!");
    });
    socket.on("logout succeeded", () => {
      dispatch({ type: "logout succeeded" });
    });
    socket.on("users", users => {
      dispatch({ type: "users", payload: users });
    });
    socket.on('invitation', inviter => {
      dispatch({type:'invitation', payload: inviter});
    });
    socket.on('invitation canceled', () => {
      dispatch({type:'invitation canceled'});
    });
    socket.on('invitation accepted', () => {
      dispatch({type:'invitation accepted'});
    });
    socket.on('game ended', () => {
      dispatch({type:'game ended'});
    });
    socket.on('connect', (e) => {
      console.log('connect', socket.id, context.appState.app);
      if (context.appState.app.user) {
        console.log('Here I should try relogging in', context.appState.app.user);;;
      }
    });
    // socket.on('connect_error', (e) => {
    //   console.log('connect_error', e);
    // });
    // socket.on('connect_timeout', (e) => {
    //   console.log('connect_timeout', e);
    // });
    // socket.on('error', (e) => {
    //   console.log('error', e);
    // });
    socket.on('disconnect', (e) => {
      dispatch({type: 'disconnected'});
      console.log('disconnect', e);
    });
    // socket.on('reconnect', (e) => {
    //   console.log('reconnect', e);
    // });
    // socket.on('reconnect_attempt', (e) => {
    //   console.log('reconnect_attempt', e);
    // });
    // socket.on('reconnecting', (e) => {
    //   console.log('reconnecting', e);
    // });
    // socket.on('reconnect_error', (e) => {
    //   console.log('reconnect_error', e);
    // });
    // socket.on('reconnect_failed', (e) => {
    //   console.log('reconnect_failed', e);
    // });
    // socket.on('ping', (e) => {
    //   console.log('ping', e);
    // });
    // socket.on('pong', (e) => {
    //   console.log('pong', e);
    // });
  }, []);

  return (
    <AppContext.Provider value={context}>
      <Main />
      <Toasts toasts={appState.toast.toasts}/>
    </AppContext.Provider>
  );
}

ReactDOM.render(<App />, document.getElementById("main"));
