import { useState, useContext, useCallback, useEffect, useRef } from "react";
import { useSprings, animated } from "react-spring";
import { useDrag } from "react-use-gesture";
import cn from "classnames";

import { Utils } from "../../contexts/Utils";

export default function DatePicker({ data, isLastInteractible, parentData }) {
    const { clamp } = useContext(Utils);
    const { pickerType } = data;

    const getHoursPickerLength = () => {
        return 24;
    };

    const getMinutesPickerLength = () => {
        return 60;
    };

    const getHoursPickerValue = (i) => {
        return i;
    };

    const getMinutesPickerValue = (i) => {
        return i;
    };

    // #################################################
    //   SPRING STYLE
    // #################################################

    const hoursStyle = useCallback(
        (i, currentIndex) =>
            Math.abs(i - currentIndex) < 6
                ? {
                      y:
                          i === currentIndex
                              ? "0rem"
                              : ` ${(i - currentIndex) * 1.2 + 0.5 * (i - currentIndex < 0 ? -1 : 1)}rem`,
                      scale: i === currentIndex ? 1.4 : 1,
                      opacity: i === currentIndex ? 1 : 0.9 - Math.abs(i - currentIndex) * 0.35,
                      fontWeight: i === currentIndex ? 600 : 400,
                  }
                : {},
        []
    );

    const minutesStyle = useCallback(
        (i, currentIndex) =>
            Math.abs(i - currentIndex) < 6
                ? {
                      y:
                          i === currentIndex
                              ? "0rem"
                              : ` ${(i - currentIndex) * 1.2 + 0.5 * (i - currentIndex < 0 ? -1 : 1)}rem`,
                      scale: i === currentIndex ? 1.4 : 1,
                      opacity: i === currentIndex ? 1 : 0.9 - Math.abs(i - currentIndex) * 0.35,
                      fontWeight: i === currentIndex ? 600 : 400,
                  }
                : {},
        []
    );

    // #################################################
    //   STATE
    // #################################################

    const [currentHour, setCurrentHour] = useState(parentData.current[pickerType].h);
    const [currentMinute, setCurrentMinute] = useState(parentData.current[pickerType].m);

    const [ourSprings, hourApi] = useSprings(getHoursPickerLength(), (i) => ({
        ...hoursStyle(i, currentHour),
    }));
    const [minuteSprings, minuteApi] = useSprings(getMinutesPickerLength(), (i) => ({
        ...minutesStyle(i, currentMinute),
    }));

    useEffect(() => {
        hourApi.start((i) => ({ ...hoursStyle(i, currentHour) }));
    }, [hourApi, currentHour, hoursStyle]);

    useEffect(() => {
        minuteApi.start((i) => ({ ...minutesStyle(i, currentMinute) }));
    }, [minuteApi, currentMinute, minutesStyle]);

    // #################################################
    //   GESTURE
    // #################################################

    const initialHourI = useRef(0);

    // Vertical gesture
    const hourGestureBind = useDrag(
        ({ event, first, down, movement: [, my] }) => {
            event.stopPropagation();

            if (first) initialHourI.current = currentHour;

            if (down) {
                const disp = -my;

                // 16 * 1.4 is the distance in px between 2 nums
                const newIndex = clamp(
                    initialHourI.current + Math.round(disp / (16 * 1.4)),
                    0,
                    getHoursPickerLength() - 1
                );

                setCurrentHour(newIndex);
            }
        },
        { filterTaps: true, axis: "y" }
    );

    const initialMinuteI = useRef(0);

    // Vertical gesture
    const minuteGestureBind = useDrag(
        ({ event, first, down, movement: [, my] }) => {
            event.stopPropagation();

            if (first) initialMinuteI.current = currentMinute;

            if (down) {
                const disp = -my;

                // 16 * 1.4 is the distance in px between 2 nums
                const newIndex = clamp(
                    initialMinuteI.current + Math.round(disp / (16 * 1.4)),
                    0,
                    getMinutesPickerLength() - 1
                );

                setCurrentMinute(newIndex);
            }
        },
        { filterTaps: true, axis: "y" }
    );

    // #################################################
    //   DATA MANAGEMENT
    // #################################################

    // Save the hour data when the picker changes
    useEffect(() => {
        if (!(pickerType in parentData.current)) return;
        parentData.current[pickerType].h = currentHour;
    }, [currentHour, parentData, pickerType]);

    // Save the minute data when the picker changes
    useEffect(() => {
        if (!(pickerType in parentData.current)) return;
        parentData.current[pickerType].m = currentMinute;
    }, [currentMinute, parentData, pickerType]);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className={cn("HealthPicker", { last: isLastInteractible })}>
            <div className="pickerContainer" {...hourGestureBind()}>
                {ourSprings.map(
                    (styles, i) =>
                        Math.abs(i - currentHour) < 6 && (
                            <animated.div className={"element"} key={i} style={styles}>
                                {getHoursPickerValue(i)}
                            </animated.div>
                        )
                )}
            </div>
            <div className="infoContainer point">h</div>
            <div className="pickerContainer" {...minuteGestureBind()}>
                {minuteSprings.map(
                    (styles, i) =>
                        Math.abs(i - currentMinute) < 6 && (
                            <animated.div className={"element"} key={i} style={styles}>
                                {getMinutesPickerValue(i)}
                            </animated.div>
                        )
                )}
            </div>
            <div className="infoContainer">m</div>
        </div>
    );
}
