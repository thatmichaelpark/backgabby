import React, { useContext, useEffect } from "react";
import Checker from "./Checker";
import Die from './Die';
import EndGameButton from './EndGameButton';

import { AppContext } from "../app";
import {
  BOARD_HEIGHT2,
  BOARD_BARWIDTH2,
  BOARD_HALF_WIDTH,
  POINT_HEIGHT,
  POINT_WIDTH,
  COLOR_BACKGROUND,
  COLOR_HOME,
  COLOR_BAR,
  COLOR_BOARD,
  COLOR_POINT0,
  COLOR_POINT1,
  CHECKER_RADIUS
} from "./constants";

export function pileX(i, boardOrientation) {
  function _pileX(i) {
    if (i <= 6) {
      return BOARD_BARWIDTH2 + POINT_WIDTH * (6.5 - i);
    }
    return -BOARD_BARWIDTH2 + POINT_WIDTH * (6.5 - i);
  }
  const s = boardOrientation & 2 ? -1 : 1;
  if (i <= 12) {
    return _pileX(i) * s;
  } else if (i <= 24) {
    return -_pileX(i - 12) * s;
  } else if (i === 25 || i === 26) {
    return 0;
  } // else 27, 28
  return (BOARD_BARWIDTH2 + BOARD_HALF_WIDTH + POINT_WIDTH / 2) * s;
}

export function pileY(i, n, isInviter, boardOrientation) {
  const h = (n + 0.5) * CHECKER_RADIUS * 2;
  const s = (isInviter ? 1 : -1) * (boardOrientation & 1 ? -1 : 1);
  if (i <= 12) {
    return (BOARD_HEIGHT2 - h) * s;
  } else if (i <= 24) {
    return (-BOARD_HEIGHT2 + h) * s;
  } else if (i === 25 || i === 26) {
    return (CHECKER_RADIUS + n * CHECKER_RADIUS * 2) * s * (i & 1 ? -1 : 1);  
  } // else 27, 28
  return -(BOARD_HEIGHT2 - CHECKER_RADIUS - n * CHECKER_RADIUS * 2) * s * (i & 1 ? -1 : 1);  
}

const points = [];
const rects = [];

for (let i = 0; i < 6; ++i) {
  const w = BOARD_HALF_WIDTH / 6;
  const x0 = -BOARD_BARWIDTH2 - BOARD_HALF_WIDTH + POINT_WIDTH * i;
  const x1 = x0 + w;
  const x2 = (x0 + x1) / 2;
  const y0 = -BOARD_HEIGHT2;
  const y1 = y0 + POINT_HEIGHT;
  const color = i & 1 ? COLOR_POINT1 : COLOR_POINT0;
  points.push({ coords: [x0, y0, x1, y0, x2, y1], color });
  points.push({ coords: [-x0, -y0, -x1, -y0, -x2, -y1], color });
  rects.push({ coords: [x0, y0, x1, y0, x1, 0, x0, 0], point: i });
  rects.push({ coords: [-x0, -y0, -x1, -y0, -x1, -0, -x0, -0], point: i + 12 });
}
for (let i = 0; i < 6; ++i) {
  const w = BOARD_HALF_WIDTH / 6;
  const x0 = BOARD_BARWIDTH2 + POINT_WIDTH * i;
  const x1 = x0 + w;
  const x2 = (x0 + x1) / 2;
  const y0 = -BOARD_HEIGHT2;
  const y1 = y0 + POINT_HEIGHT;
  const color = i & 1 ? COLOR_POINT1 : COLOR_POINT0;
  points.push({ coords: [x0, y0, x1, y0, x2, y1], color });
  points.push({ coords: [-x0, -y0, -x1, -y0, -x2, -y1], color });
  rects.push({ coords: [x0, y0, x1, y0, x1, 0, x0, 0], point: i + 6 });
  rects.push({ coords: [-x0, -y0, -x1, -y0, -x1, -0, -x0, -0], point: i + 18 });
}
const x = BOARD_BARWIDTH2 + BOARD_HALF_WIDTH;
rects.push({coords:[-BOARD_BARWIDTH2, 0, BOARD_BARWIDTH2, 0, BOARD_BARWIDTH2, -BOARD_HEIGHT2, -BOARD_BARWIDTH2, -BOARD_HEIGHT2], point:24} ); // white bar
rects.push({coords:[-BOARD_BARWIDTH2, 0, BOARD_BARWIDTH2, 0, BOARD_BARWIDTH2, BOARD_HEIGHT2, -BOARD_BARWIDTH2, BOARD_HEIGHT2], point:25} ); // black bar
rects.push({ coords: [x, 0, x + POINT_WIDTH, 0, x + POINT_WIDTH, BOARD_HEIGHT2, x, BOARD_HEIGHT2], point: 26 }); // white home
rects.push({ coords: [x, 0, x + POINT_WIDTH, 0, x + POINT_WIDTH, -BOARD_HEIGHT2, x, -BOARD_HEIGHT2], point: 27 }); // black home
rects.push({ coords: [-x, 0, -x - POINT_WIDTH, 0, -x - POINT_WIDTH, BOARD_HEIGHT2, -x, BOARD_HEIGHT2], point: 28 }); // white home
rects.push({ coords: [-x, 0, -x - POINT_WIDTH, 0, -x - POINT_WIDTH, -BOARD_HEIGHT2, -x, -BOARD_HEIGHT2], point: 29 }); // black home

export default function() {
  const {
    appState: { app, game },
    dispatch
  } = useContext(AppContext);

  useEffect(() => {
    app.socketRef.current.on("game event", event => {
      dispatch(event);
    });
    return () => {
      if (app.socketRef.current) {
        app.socketRef.current.off('game event');
      }
    };
  }, []);
  useEffect(() => {
    const isInviter = app.user.id === app.inviter.id;
    dispatch({
      type: "begin",
      payload: {
        isInviter,
        socket: app.socketRef.current,
        inviter: app.inviter,
        invitee: app.invitee,
        boardOrientation: localStorage.getItem('boardOrientation') == null ? 0 : JSON.parse(localStorage.getItem('boardOrientation')),
        checkers: Array(30)
          .fill()
          .map((_, i) => ({
            id: i,
            x: i / 30,
            y: 0,
            isMine: (i >= 15) ^ isInviter,
            smooth: false
          })),
        piles: Array(31)
          .fill()
          .map((_, i) => []),
        dice: [],
        selectedCheckerId: -1,
        isMyTurn: false,
        iAmWhite: localStorage.getItem('iAmWhite') === null || JSON.parse(localStorage.getItem('iAmWhite')),
        zOrder: Array(30).fill().map((_, i) => i),
        undoBuffer: []
      }
    });
    if (isInviter) {
      dispatch({ type: "roll to start" });
    }
  }, []);
  function initializeBoard() {
    const ps = [
      24,
      24,
      13,
      13,
      13,
      13,
      13,
      8,
      8,
      8,
      6,
      6,
      6,
      6,
      6,
      1,
      1,
      12,
      12,
      12,
      12,
      12,
      17,
      17,
      17,
      19,
      19,
      19,
      19,
      19
    ];
    ps.forEach((p, i) => {
      dispatch({ type: "move", payload: { i, pile: p, smooth: false } });
    });
  }
  
  useEffect(initializeBoard, []);

  useEffect(() => {
    if (game.isMyTurn) {
      dispatch({type: 'add toast', payload: {toast: 'Your turn', type: 'good'}});
    }
  }, [game.isMyTurn]);

  const homePoint = (true ? [26, 27, 28, 29] : [27, 26, 29, 28])[game.boardOrientation];

  return (
    <div id="board" style={{ backgroundColor: COLOR_BACKGROUND }}>
      <svg viewBox="-1.05 -1.05 2.1 2.1">
        <rect
          x={-BOARD_BARWIDTH2}
          y={-BOARD_HEIGHT2}
          width={BOARD_BARWIDTH2 * 2}
          height={BOARD_HEIGHT2 * 2}
          fill={COLOR_BAR}
        />
        <rect
          x={BOARD_BARWIDTH2}
          y={-BOARD_HEIGHT2}
          width={BOARD_HALF_WIDTH}
          height={BOARD_HEIGHT2 * 2}
          fill={COLOR_BOARD}
        />
        <rect
          x={-BOARD_BARWIDTH2 - BOARD_HALF_WIDTH}
          y={-BOARD_HEIGHT2}
          width={BOARD_HALF_WIDTH}
          height={BOARD_HEIGHT2 * 2}
          fill={COLOR_BOARD}
        />
        {points.map((p, i) => (
          <polygon key={i} points={p.coords.join(",")} fill={p.color} />
        ))}
        {game.zOrder.map(i => {
          const { id, x, y, point, isMine, smooth } = game.checkers[i];
          return (
            <Checker
              id={id}
              key={id}
              x={x}
              y={y}
              point={point}
              isMine={isMine}
              isSelected={id === game.selectedCheckerId}
              smooth={smooth}
              iAmWhite={game.iAmWhite}
            />
          );
        })}
        {rects.map((p, i) => 
            <polygon 
                className="hoverable"
                key={i} 
                points={p.coords.join(',')} 
                fill={'transparent'}
                stroke={p.point === homePoint ? COLOR_HOME : 'transparent'}
                strokeWidth={0.005}
                onClick={() => onPileClick(p.point)}
            />
        )}
        {game.dice.map((d, i) => <Die key={i} pips={d.pips} i={i} n={game.dice.length} isUsed={d.isUsed}/>)}
      </svg>
      {game.isMyTurn &&
        <div id="control-container">
          <button 
            onClick={() => dispatch({type: 'roll dice'})} 
            disabled={game.dice.length > 0}
            className={game.dice.length === 0 ? 'blinking-bg' : ''}
          >
            Roll dice
          </button>
          <button onClick={() => dispatch({type: 'undo'})} disabled={game.undoBuffer.length === 0}>Undo</button>
          <button 
            onClick={() => dispatch({type: 'end turn'})} 
            disabled={game.dice.length === 0}
            className={game.dice.length > 0 && game.dice.reduce((acc, die) => acc & die.isUsed, true) ? 'blinking-bg' : ''}
          >
            End turn
          </button>
          <EndGameButton />
        </div>
      }
    </div>
  );

  function onPileClick(p) {
    const twos = game.boardOrientation & 2;
    let ones = game.boardOrientation & 1;
    if (!game.isInviter) {
      ones = 1 - ones;
    }
    const xl8 = [
      [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 25, 26, 27, 28, 29, 30],
      [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 26, 25, 28, 27, 30, 29],
      [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 25, 26, 29, 30, 27, 28],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 25, 30, 29, 28, 27],
    ][twos + ones];
    const pileNo = xl8[p];
    if (!game.isMyTurn) {
      dispatch({type: 'add toast', payload: {toast: 'Not your turn!', type: 'bad'}});
      return;
    }
    
    const pile = game.piles[pileNo];
    const n = pile.length;
    if (game.selectedCheckerId < 0) { // nothing selected
      if (pileNo === 27 || pileNo === 28) {
        return;
      }
      const jail = game.piles[game.isInviter ? 25 : 26];
      if (jail.length > 0) {
        dispatch({type: 'select checker', payload: {id: jail[jail.length - 1]}});
        return;
      }
      if (n > 0) {
        const id = pile[n - 1];
        if (game.checkers[id].isMine) {
          dispatch({type: 'select checker', payload: {id}});
          return;
        }
      }
    } else { // one checker already selected
      if (n > 0) {
        const id = pile[n - 1];
        if (game.selectedCheckerId === id) {
          dispatch({type: 'select checker', payload: {id: -1}});
          return;
        }
      }

      const startPileNo = game.checkers[game.selectedCheckerId].pile;
      const spn = startPileNo === 25 || startPileNo === 26 ? (game.isInviter ? 25 : 0) : startPileNo // on the bar?

      if (pileNo === 27 && game.isInviter) {
        let outsideOfHome = false;
        game.checkers.forEach(checker => {
          if (checker.isMine && checker.pile > 6 && checker.pile <= 26) {
            outsideOfHome = true;
          }
        });
        if (outsideOfHome) {
          dispatch({type: 'add toast', payload: {toast: 'Cannot bear off yet!', type: 'bad'}});
          return;
        }
        // startPileNo in [1..6]
        if (findDie(game.dice, startPileNo) < 0) {
          if (findDieAtLeast(game.dice, startPileNo) < 0) {
            return;
          }
          // make sure there are no checkers on piles (startPileNo + 1) through 6:
          let found = false;
          for (let i = startPileNo + 1; i <= 6; ++i) {
            if (game.piles[i].length) {
              found = true;
              break;
            }
          }
          if (found) {
            dispatch({type: 'add toast', payload: {toast: 'Stricter rule enforcement!', type: 'bad'}});
            return;
          }
        }
      }
      if (pileNo === 28 && !game.isInviter) {
        let outsideOfHome = false;
        game.checkers.forEach(checker => {
          if (checker.isMine && checker.pile < 19) {
            outsideOfHome = true;
          }
        });
        if (outsideOfHome) {
          dispatch({type: 'add toast', payload: {toast: 'Cannot bear off yet!', type: 'bad'}});
          return;
        }
        // startPileNo in [19..24]
        if (findDie(game.dice, 25 - startPileNo) < 0) {
          if (findDieAtLeast(game.dice, 25 - startPileNo) < 0) {
            return;
          }
          // make sure there are no checkers on piles 19 through (startPileNo - 1):
          let found = false;
          for (let i = 19; i <= startPileNo - 1; ++i) {
            if (game.piles[i].length) {
              found = true;
              break;
            }
          }
          if (found) {
            dispatch({type: 'add toast', payload: {toast: 'Stricter rule enforcement!', type: 'bad'}});
            return;
          }
        }
      }
      let pn = pileNo === 25 || pileNo === 26 ? (game.isInviter ? 25 : 0) : pileNo;
      if (pn >= 27) {
        if (game.isInviter) {
          if (pn === 27) {
            pn = 0;
          } else {
            pn = Infinity;
          }
        } else {
          if (pn === 28) {
            pn = 25;
          } else {
            pn = -Infinity;
          }
        }
      }
      // const pn = pileNo === 27 || pileNo === 28 ? (game.isInviter ? 0 : 25) : pileNo;

      
      const d = game.isInviter ? spn - pn : pn - spn;
      if (d < 1 || d > 6) {
        return;
      }
      if (n === 1 && !game.checkers[pile[0]].isMine) {
        // landing on a single checker of the opponent
        const di = findDie(game.dice, d);
        if (di < 0) {
          return;
        }
        dispatch({type: 'move from pile', payload: {fromPileNo: pileNo, toPileNo: game.isInviter ? 26 : 25}});
        dispatch({type: 'move from pile', payload: {fromPileNo: startPileNo, toPileNo: pileNo}});
        dispatch({type: 'save for undo', payload: {
          moves: [
            {fromPileNo: startPileNo, toPileNo: pileNo},
            {fromPileNo: pileNo, toPileNo: game.isInviter ? 26 : 25}
          ], 
          diceString: JSON.stringify(game.dice)
        }});
        dispatch({type: 'use die', payload: {di}});
      } else if (n === 0 || game.checkers[pile[0]].isMine) {
        // landing on an empty point or a point occupied by my checkers
        const dmax = pileNo === 27 || pileNo === 28 ? 6 : d;
        let di;
        for (let q = d; q <= dmax; ++q) {
          di = findDie(game.dice, q);
          if (di >= 0) {
            break;
          }
        }
        if (di < 0) {
          return;
        }
        dispatch({type: 'move from pile', payload: {fromPileNo: startPileNo, toPileNo: pileNo}});
        dispatch({type: 'save for undo', payload: {
          moves: [
            {fromPileNo: startPileNo, toPileNo: pileNo}
          ], 
          diceString: JSON.stringify(game.dice)
        }});
        dispatch({type: 'use die', payload: {di}});

        dispatch({type: 'use die', payload: {di}});
      }
    }
  }
}

function findDie(dice, d) {
  for (let i = 0; i < dice.length; ++i) {
    if (!dice[i].isUsed && dice[i].pips === d) {
      return i;
    }
  }
  return -1;
}

function findDieAtLeast(dice, d) {
  for (let i = 0; i < dice.length; ++i) {
    if (!dice[i].isUsed && dice[i].pips >= d) {
      return i;
    }
  }
  return -1;
}

