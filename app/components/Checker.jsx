import React, { useEffect, useRef, useState } from 'react';
import { CHECKER_RADIUS, CHECKER_SPEED, CHECKER_STROKEWIDTH } from './constants';

export default React.memo(function (props) {
    const { id, isMine, isSelected, smooth, iAmWhite } = props;
    const [blah, setBlah] = useState(0);
    const tRef = useRef(1);
    const xRef = useRef(0);
    const yRef = useRef(0);
    const xPrevRef = useRef(0);
    const yPrevRef = useRef(0);
    useEffect(() => {
        xPrevRef.current = xRef.current;
        yPrevRef.current = yRef.current;
        if (!smooth) {
            return;
        }
        tRef.current = 0;
        const dist = Math.hypot(props.x - xPrevRef.current, props.y - yPrevRef.current);
        const speed = CHECKER_SPEED / dist;
        const time0 = Date.now();
        requestAnimationFrame(function raf() {
            tRef.current = (Date.now() - time0) * speed;
            if (tRef.current >= 1) {
                tRef.current = 1;
            } else {
                requestAnimationFrame(raf);
            }
            const t = (Math.sin((tRef.current - 0.5) * Math.PI) + 1) * 0.5;
            xRef.current = xPrevRef.current * (1 - t) + props.x * t;
            yRef.current = yPrevRef.current * (1 - t) + props.y * t;
            setBlah(tRef.current);
        });
    }, [props]);

    let x;
    let y;
    if (smooth) {
        x = xRef.current;
        y = yRef.current;
    } else {
        x = xRef.current = props.x;
        y = yRef.current = props.y;
    }
    const [myFill, myStroke] = iAmWhite ? ['white', 'silver'] : ['black', 'slategray'];
    const [theirFill, theirStroke] = iAmWhite ? ['black', 'slategray'] : ['white', 'silver'];
    return (
        <circle
            onClick={() => console.log('click', id)}
            cx={x}
            cy={y}
            r={CHECKER_RADIUS}
            stroke={isSelected ? 'red' : isMine ? myStroke : theirStroke}
            strokeWidth={isSelected ? 3 * CHECKER_STROKEWIDTH : CHECKER_STROKEWIDTH}
            fill={isMine ? myFill : theirFill}
        />
    );
});
