import { useState, useContext, useCallback, useEffect, useRef } from "react";
import { useSprings, animated } from "react-spring";
import { useDrag } from "react-use-gesture";
import cn from "classnames";
import SVG from "react-inlinesvg";

import { API } from "../../contexts/API";
import { Utils } from "../../contexts/Utils";

export default function Picker({ data, nextPhase, isLastInteractible, parentData }) {
    const { isFastDesiredStartTimeValid, isFastObjectiveValid, isHeightValid, isWeightValid, isWeightObjectiveValid } =
        useContext(API);
    const { invlerp, clamp } = useContext(Utils);

    const { pickerType, action } = data;

    // const getPickerRange = () => {
    //     // [includive, non-inclusive)
    //     if (pickerType === "fastDuration") return [12, 21];
    //     else if (pickerType === "fastStartTime") return [0, 48];
    //     else if (pickerType === "height") return [0, 301];
    //     else if (pickerType === "weight") return [0, 701];
    //     else if (pickerType === "objectiveWeight") return [parentData.weight, 701];
    // };

    const getPickerLength = () => {
        if (pickerType === "fastDuration") return 9;
        else if (pickerType === "fastStartTime") return 48;
        else if (pickerType === "height") return 300;
        else if (pickerType === "weight") return 700;
        else if (pickerType === "objectiveWeight") return 700; // ROJAS return parentData.weight - 700;
    };

    const getPickerValue = (i) => {
        if (pickerType === "fastDuration") return `${12 + i}h`;
        else if (pickerType === "fastStartTime") return `${Math.floor(i / 2)}:${i % 2 !== 0 ? "30" : "00"}`;
        else if (pickerType === "height") return 300;
        else if (pickerType === "weight") return 700;
        else if (pickerType === "objectiveWeight") return 700; // ROJAS return parentData.weight - 700;
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

    const [currentElem, setCurrentElem] = useState(0);
    // const [range, setRange] = useState(getPickerRange());
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
    //   CHECK VALIDITY
    // #################################################

    // #################################################
    //   HANDLERS
    // #################################################

    // #################################################
    //   FOCUS & INITIAL DATA
    // #################################################

    // useEffect(() => {
    //     inputRef.current.value = parentData.current[action];
    // }, [parentData, action]);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className={cn("Picker", { last: isLastInteractible })} {...gestureBind()}>
            {springs.map(
                (styles, i) =>
                    Math.abs(i - currentElem) < 5 && (
                        <animated.div className={"element"} key={i} style={styles}>
                            {getPickerValue(i)}
                        </animated.div>
                    )
            )}
        </div>
    );
}
