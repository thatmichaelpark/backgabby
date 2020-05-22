import React, { useContext } from "react";
import { AppContext } from "../app";
import {
  BOARD_BARWIDTH2,
  BOARD_HALF_WIDTH,
  DIE_SIZE,
  DIE_SPACING,
  DIE_PIPRADIUS,
  DIE_PIPCOLOR,
  DIE_USEDPIPCOLOR,
  DIE_STROKEWIDTH,
  DIE_STROKECOLOR,
  DIE_COLOR,
  DIE_USEDSTROKECOLOR,
  DIE_USEDCOLOR
} from "./constants";

export default function Die({ pips, i, n, isUsed }) {
  const {
    appState: { app, game }
  } = useContext(AppContext);

  const x1 =
    (BOARD_BARWIDTH2 + BOARD_HALF_WIDTH / 2) * (game.isMyTurn ? 1 : -1) +
    (i - (n - 1) / 2) * DIE_SPACING;
  const w = DIE_SIZE * 0.27;
  const x0 = x1 - w;
  const x2 = x1 + w;
  const y0 = -w;
  const y1 = 0;
  const y2 = w;
  const is = [
    [],
    [{ x: x1, y: y1 }],
    [{ x: x0, y: y0 }, { x: x2, y: y2 }],
    [{ x: x0, y: y0 }, { x: x1, y: y1 }, { x: x2, y: y2 }],
    [{ x: x0, y: y0 }, { x: x0, y: y2 }, { x: x2, y: y0 }, { x: x2, y: y2 }],
    [
      { x: x1, y: y1 },
      { x: x0, y: y0 },
      { x: x0, y: y2 },
      { x: x2, y: y0 },
      { x: x2, y: y2 }
    ],
    [
      { x: x0, y: y0 },
      { x: x0, y: y1 },
      { x: x0, y: y2 },
      { x: x2, y: y0 },
      { x: x2, y: y1 },
      { x: x2, y: y2 }
    ]
  ];
  const dieColor = isUsed ? DIE_USEDCOLOR : DIE_COLOR;
  const stroke = isUsed ? DIE_USEDSTROKECOLOR : DIE_STROKECOLOR;
  const pipColor = isUsed ? DIE_USEDPIPCOLOR : DIE_PIPCOLOR;
  return (
    <>
      <rect
        x={x1 - DIE_SIZE / 2}
        y={-DIE_SIZE / 2}
        width={DIE_SIZE}
        height={DIE_SIZE}
        fill={dieColor}
        stroke={stroke}
        strokeWidth={DIE_STROKEWIDTH}
      />
      {is[pips].map(({ x, y }, i) => (
        <circle key={i} cx={x} cy={y} r={DIE_PIPRADIUS} fill={pipColor} />
      ))}
    </>
  );
}
