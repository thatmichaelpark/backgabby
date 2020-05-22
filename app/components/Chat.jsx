import React, { useEffect, useRef, useState } from "react";

export default React.memo(function Chat({inviter, invitee, isInviter, socket}) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.on("chat message in", ({message, sender}) => {
      setMsgs(msgs => [...msgs, {message, sender}]);
    });
    return () => {
      socket.off('chat message in');
    }
  }, []);

  function onSubmit(e) {
    e.preventDefault();
    const sender = isInviter ? inviter : invitee;
    socket.emit("chat message", {message: input, sender, inviter, invitee});
    setMsgs([...msgs, {sender, message: input}])
    setInput("");
  }

  return (
    <div id="chat">
      <div id="messages">
        {msgs.map((msg, i) => (
          <p key={i}><span className="sender">{msg.sender.username}: </span><span className="message">{msg.message}</span></p>
        ))}
      </div>
      <div id="input">
        <form onSubmit={onSubmit}>
          <input
            autoComplete="off"
            value={input}
            onChange={e => {
              setInput(e.target.value);
            }}
          />
          <button>Send</button>
        </form>
      </div>
    </div>
  );
});
