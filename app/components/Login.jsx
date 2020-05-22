import React, {useContext, useState} from 'react';
import {AppContext} from '../app';

export default function Login() {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [password, setPassword] = useState(localStorage.getItem('password') || '');
  const {appState, dispatch} = useContext(AppContext);
  
  function onSubmit(e) {
    e.preventDefault();
    dispatch({type: 'log in', payload: {username, password}});
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);
  }
  
  return (
    <>
      <h1>Welcome to Backgabby!</h1>
      <form onSubmit={onSubmit}>
        <input name="username" onChange={e => setUsername(e.target.value)} placeholder="Username" value={username}/>
        <input name="password" onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" value={password}/>
        <button>Log In</button>
      </form>
    </>
  )
}
