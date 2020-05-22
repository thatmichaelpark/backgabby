import React, { useEffect, useRef, useState } from "react";
import Board from './Board';
import Chat from './Chat';

export default function Game({inviter, invitee, isInviter, socket}) {
  return (
    <>
      <Board/>
      {null && <Chat inviter={inviter} invitee={invitee} isInviter={isInviter} socket={socket}/>}
    </>
  );
}
