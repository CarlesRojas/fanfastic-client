import { useState, useContext, useCallback, useEffect, useRef } from "react";
import { useSprings, animated } from "react-spring";
import { useDrag } from "react-use-gesture";
import cn from "classnames";

import { Utils } from "../../contexts/Utils";

export default function FastStartTimePicker({ data, isLastInteractible, parentData }) {
    const { clamp } = useContext(Utils);
    const { pickerType } = data;

    const getPickerLength = () => {
        return 24;
    };

    const getPickerValue = (i, jsx) => {
        if (i % 2 === 0)
            return jsx ? (
                <>
                    <p>{12 + i / 2}</p>
                    <p className="minutes">:00</p>
                </>
            ) : (
                `${12 + i / 2}:00`
            );
        else
            return jsx ? (
                <>
                    <p>{12 + (i - 1) / 2}</p>
                    <p className="minutes">:30</p>
                </>
            ) : (
                `${12 + (i - 1) / 2}:30`
            );
    };

    const getInfo = (i) => {
        const getEndTime = () => {
            const minutes = i % 2 === 0 ? ":00" : ":30";
            const startTime = i % 2 === 0 ? 12 + i / 2 : 12 + (i - 1) / 2;
            const duration = 12 + parentData.current.fastDuration;
            const endTime = (startTime + duration) % 24;
            return `${endTime}${minutes}`;
        };

        return (
            <>
                <span>The fasting would last from </span>
                <span className="highlight">{getPickerValue(i, false)}</span>
                <span> to </span>
                <span className="highlight">{getEndTime()}</span>
                <span> of the next day.</span>
            </>
        );
    };

    // #################################################
    //   SPRING STYLE
    // #################################################

    const style = useCallback(
        (i, currentIndex) => ({
            x: i === currentIndex ? "0rem" : ` ${(i - currentIndex) * 3 + 0.5 * (i - currentIndex < 0 ? -1 : 1)}rem`,
            scale: i === currentIndex ? 1.4 : 1,
            opacity: i === currentIndex ? 1 : 1 - Math.abs(i - currentIndex) * 0.2,
            fontWeight: i === currentIndex ? 600 : 400,
        }),
        []
    );

    // #################################################
    //   STATE
    // #################################################

    const [currentElem, setCurrentElem] = useState(parentData.current[pickerType]);

    const [springs, api] = useSprings(getPickerLength(), (i) => ({ ...style(i, currentElem) }));

    useEffect(() => {
        api.start((i) => ({ ...style(i, currentElem) }));
    }, [api, currentElem, style]);

    // #################################################
    //   GESTURE
    // #################################################

    const initialI = useRef(0);

    // Vertical gesture
    const gestureBind = useDrag(
        ({ event, first, down, movement: [mx] }) => {
            event.stopPropagation();

            if (first) initialI.current = currentElem;

            if (down) {
                const disp = -mx;

                // 16 * 3.2 is the distance in px between 2 nums
                const newIndex = clamp(initialI.current + Math.round(disp / (16 * 3.2)), 0, getPickerLength() - 1);

                setCurrentElem(newIndex);
            }
        },
        {
            filterTaps: true,
            axis: "x",
        }
    );

    // #################################################
    //   DATA MANAGEMENT
    // #################################################

    // Save the date when the picker changes
    useEffect(() => {
        if (!(pickerType in parentData.current)) return;
        parentData.current[pickerType] = currentElem;
    }, [currentElem, parentData, pickerType]);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className={cn("FastPicker", { last: isLastInteractible })} {...gestureBind()}>
            <div className="pickerContainer">
                {springs.map(
                    (styles, i) =>
                        Math.abs(i - currentElem) < 10 && (
                            <animated.div className={"element"} key={i} style={styles}>
                                {getPickerValue(i, true)}
                            </animated.div>
                        )
                )}
            </div>
            <div className="infoContainer">{getInfo(currentElem)}</div>
        </div>
    );
}
