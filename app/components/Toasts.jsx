import React, {useContext, useEffect, useState} from 'react';
import { AppContext } from "../app";

export default function Toasts({toasts}) {
  return (
    <div id='toast-container'>
       {toasts.map((toast, i) =>
          <Toast key={toast.id} i={i} toast={toast}/>
       )}
    </div>
  );
}

function Toast({i, toast: {id, text, type}}) {
  const {
    dispatch
  } = useContext(AppContext);
  useEffect(() => {
    const t = setTimeout(() => {
      onClick();      
    }, 3333);
    return () => {
      clearTimeout(t);
    };
  }, [])
  const [dead, setDead] = useState(false);
  function onClick() {
    setDead(true);
    setTimeout(() => {
      dispatch({type: 'remove toast', payload: {id}});
    }, 250);
  }
  return (
    <div 
      className={`toast ${dead ? 'dead' : ''} toast-type-${type || 'neutral'}`} style={{top: `${i * 4 + 2}em`}}
      onClick={onClick}
    >
      {text}
      <button onClick={onClick}>
      &times;
      </button>
    </div>
  );
}