import {pileX, pileY} from './components/Board';

export function appReducer(prevState, { type, payload }) {
  const socket = prevState.socketRef.current;
  switch (type) {
    case "set socket":
      prevState.socketRef.current = payload;
      return { ...prevState, isLoggedIn: false, isInviting: false, isInvited: false, isPlaying: false, user: null };
    case "disconnected":
      console.log('disconnected');;;
      prevState.socketRef.current = payload;
      return { ...prevState, isLoggedIn: false, isInviting: false, isInvited: false, isPlaying: false, user: null };
    case "log in":
      socket.emit("log in", payload);
      return prevState;
    case "login succeeded":
      return { ...prevState, isLoggedIn: true, isInviting: false, isInvited: false, isPlaying: false, user: payload };
    case "login failed":
      console.log("login failed");
      return prevState;
    case "log out":
      socket.emit("log out");
      return prevState;
    case "logout succeeded":
      return { ...prevState, isLoggedIn: false, isInviting: false, isInvited: false, isPlaying: false, user: null };
    case "users":
      if (prevState.isLoggedIn) {
        // Verify that user is still logged in:
        if (!payload.find(p => p.id === prevState.user.id)) {
          console.log('I got logged out!');;;
          return { ...prevState, users: payload };
          return {...prevState, isLoggedIn: false, isInviting: false, isInvited: false, isPlaying: false, users: payload}
        }
      }
      if (prevState.isInviting || prevState.isInvited || prevState.isPlaying) {
        // Verify that both parties are still connected:
        if (!payload.find(p => p.id === prevState.inviter.id) || !payload.find(p => p.id === prevState.invitee.id)) {
          console.log('Someone got logged out!');;;
          return { ...prevState, users: payload };
          return {...prevState, isInviting: false, isInvited: false, isPlaying: false, users: payload}
        }
      }
      return { ...prevState, users: payload };
    case "invite":
      socket.emit('invite', {inviter: prevState.user, invitee: payload})
      return {...prevState, isInviting: true, inviter: prevState.user, invitee: payload};
    case "invitation":
      return {...prevState, isInvited: true, inviter: payload, invitee: prevState.user};
    case 'cancel invitation':
      socket.emit('cancel invitation', {invitee: payload})
      return {...prevState, isInviting: false, inviter: null, invitee: null};
    case 'invitation canceled':
      return {...prevState, isInvited: false, inviter: null, invitee: null};
    case 'accept invitation':
      socket.emit('accept invitation', {inviter: prevState.inviter, invitee: prevState.invitee});
      return {...prevState, isInvited: false, isPlaying: true};
    case 'invitation accepted':
      return {...prevState, isInviting: false, isPlaying: true};
    case 'game ended':
      return {...prevState, isPlaying: false, inviter: null, invitee: null};
    default:
      return prevState;
  }
}

export function gameReducer(prevState, { type, payload }) {
  switch (type) {
    case 'begin':
      return {...prevState, ...payload};
    case "roll to start":
      let die1;
      let die2;
      do {
        die1 = Math.floor(Math.random() * 6) + 1;
        die2 = Math.floor(Math.random() * 6) + 1;
      } while (die1 === die2);
      const dice = [{pips: die1}, {pips: die2}];
      const isMyTurn = die1 > die2
      
      prevState.socket.emit("game event", {
        event: {
          type: "starting roll",
          payload: {
            dice
          }
        },
        inviter: prevState.inviter,
        invitee: prevState.invitee
      });
      return handleStartingRoll(prevState, dice);
    case "starting roll":
      return handleStartingRoll(prevState, payload.dice);
    case "move":
      const newState = {...prevState};
      const { i, pile, smooth } = payload;
      newState.checkers[i].x = pileX(pile, newState.boardOrientation);
      newState.checkers[i].y = pileY(pile, newState.piles[pile].length, prevState.isInviter, newState.boardOrientation);
      newState.checkers[i].pile = pile;
      newState.piles[pile].push(i);
      newState.checkers[i].smooth = smooth;
      return newState;
    case "move from pile":
      {
      prevState.socket.emit("game event", {
        event: {
          type: "moved from pile",
          payload
        },
        inviter: prevState.inviter,
        invitee: prevState.invitee
      });
      return handleMovedFromPile(prevState, payload);
      }
    case "moved from pile":
      return handleMovedFromPile(prevState, payload);
    case "select checker":
      {
      const {id} = payload;
      prevState.socket.emit("game event", {
        event: {
          type: "checker selected",
          payload: {
            id
          }
        },
        inviter: prevState.inviter,
        invitee: prevState.invitee
      });
      return handleCheckerSelected(prevState, id);
      }
    case "checker selected":
      return handleCheckerSelected(prevState, payload.id);
    case "end turn":
      {
      prevState.socket.emit("game event", {
        event: {
          type: "turn ended"
        },
        inviter: prevState.inviter,
        invitee: prevState.invitee
      });
      return handleTurnEnded(prevState);
      }
    case "turn ended":
      return handleTurnEnded(prevState);
    case "roll dice":
      {
        const die0 = Math.floor(Math.random() * 6) + 1;
        const die1 = Math.floor(Math.random() * 6) + 1;
        const dice = die0 !== die1 ? [{pips: die0}, {pips: die1}] : [{pips: die0}, {pips: die0}, {pips: die0}, {pips: die0}]
      prevState.socket.emit("game event", {
        event: {
          type: "dice rolled",
          payload: {
            dice
          }
        },
        inviter: prevState.inviter,
        invitee: prevState.invitee
      });
      return handleDiceRolled(prevState, dice);
      }
    case "dice rolled":
      return handleDiceRolled(prevState, payload.dice);
    case "use die":
      prevState.socket.emit("game event", {
        event: {
          type: "die used",
          payload: {
            di: payload.di
          }
        },
        inviter: prevState.inviter,
        invitee: prevState.invitee
      });
      return handleDieUsed(prevState, payload.di);
    case "die used":
      return handleDieUsed(prevState, payload.di);
    case "save for undo":
      prevState.socket.emit("game event", {
        event: {
          type: "saved for undo",
          payload
        },
        inviter: prevState.inviter,
        invitee: prevState.invitee
      });
      return handleSavedForUndo(prevState, payload);
    case "saved for undo":
      return handleSavedForUndo(prevState, payload);
    case "undo":
      prevState.socket.emit("game event", {
        event: {
          type: "undone",
          payload: {
          }
        },
        inviter: prevState.inviter,
        invitee: prevState.invitee
      });
      return handleUndone(prevState);
    case "undone":
      return handleUndone(prevState);
    case 'game ended':
      return {...prevState, isMyTurn: false};
    default:
      return prevState;
  }
}

function handleStartingRoll(prevState, dice) {
  const isMyTurn = prevState.isInviter ? dice[0].pips > dice[1].pips : dice[0].pips < dice[1].pips;
  return {...prevState, dice, isMyTurn};
}

function handleCheckerSelected(prevState, id) {
  return {...prevState, selectedCheckerId: id};
}

function handleTurnEnded(prevState) {
  return {...prevState, isMyTurn: !prevState.isMyTurn, dice: [], selectedCheckerId: -1, undoBuffer: []};
}

function handleDiceRolled(prevState, dice) {
  return {...prevState, dice};
}

function handleDieUsed(prevState, di) {
  const newState = {...prevState};
  newState.dice[di].isUsed = true;
  return newState;
}

function handleMovedFromPile(prevState, payload) {
  const newState = {...prevState};
  const { fromPileNo, toPileNo } = payload;
  const i = newState.piles[fromPileNo].pop(); // i-th checker's id = i
  const fromLength = newState.piles[fromPileNo].length;

  if (fromLength >= 6) {
    // let remaining checkers in from pile expand 
    const x = pileX(fromPileNo, newState.boardOrientation);
    const yMin = pileY(fromPileNo, 0, prevState.isInviter, newState.boardOrientation);
    const yMax = pileY(fromPileNo, 6, prevState.isInviter, newState.boardOrientation);

    for (let i = 0; i < fromLength; ++i) {
      const y = yMin * (1 - i / fromLength) + yMax * i / fromLength;
      newState.checkers[newState.piles[fromPileNo][i]].x = x;
      newState.checkers[newState.piles[fromPileNo][i]].y = y;
      newState.checkers[newState.piles[fromPileNo][i]].smooth = false;
    }
  }
  
  const toLength = newState.piles[toPileNo].length;
  newState.checkers[i].pile = toPileNo;
  newState.piles[toPileNo].push(i);
  newState.checkers[i].smooth = true;
  newState.selectedCheckerId = -1;
  if (toLength < 6) {
    newState.checkers[i].x = pileX(toPileNo, newState.boardOrientation);
    newState.checkers[i].y = pileY(toPileNo, toLength, prevState.isInviter, newState.boardOrientation);
  } else {
    // squash checkers in to pile
    const x = pileX(toPileNo, newState.boardOrientation);
    const yMin = pileY(toPileNo, 0, prevState.isInviter, newState.boardOrientation);
    const yMax = pileY(toPileNo, 5, prevState.isInviter, newState.boardOrientation);
    for (let i = 0; i <= toLength; ++i) {
      const y = yMin * (1 - i / toLength) + yMax * i / toLength;
      newState.checkers[newState.piles[toPileNo][i]].x = x;
      newState.checkers[newState.piles[toPileNo][i]].y = y;
      newState.checkers[newState.piles[toPileNo][i]].smooth = i === toLength;
    }
  }
  // So now let's find the i-th checker in the zOrder array and move it to the end (draws on top).
  const j = newState.zOrder.findIndex(z => z === i);
  // z[0..29] --> z[0..j-1] + z[j+1..29] + z[j]
  newState.zOrder = newState.zOrder.slice(0, j).concat(newState.zOrder.slice(j + 1, 30)).concat([newState.zOrder[j]])
  
  return newState;
}

function handleSavedForUndo(prevState, payload) {
  const undoBuffer = prevState.undoBuffer;
  undoBuffer.push(payload);
  return {...prevState, undoBuffer};
}

function handleUndone(prevState) {
  const undoBuffer = prevState.undoBuffer;
  const {moves, diceString} = undoBuffer.pop();
  const dice = JSON.parse(diceString);

  let newState = prevState;
  moves.forEach(move => {
    newState = handleMovedFromPile(newState, {fromPileNo: move.toPileNo, toPileNo: move.fromPileNo});
  });
  newState.dice = dice;
  newState.undoBuffer = undoBuffer;
  return newState;
}

export function toastReducer(prevState, {type, payload}) {
  const newState = {...prevState};
  switch(type) {
    case 'add toast':
      newState.toasts.push({id: newState.nextId++, text: payload.toast, type: payload.type});
      return newState;
    case 'remove toast':
      newState.toasts = newState.toasts.filter(toast => toast.id !== payload.id);
      return newState;
  }
  return prevState;
}