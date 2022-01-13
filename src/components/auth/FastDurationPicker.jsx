import { useState, useContext, useCallback, useEffect, useRef } from "react";
import { useSprings, animated } from "react-spring";
import { useDrag } from "react-use-gesture";
import cn from "classnames";

import { Utils } from "../../contexts/Utils";

const ONLY_ON_OCASIONS = 7;

export default function FastDurationPicker({ data, isLastInteractible, parentData }) {
    const { clamp } = useContext(Utils);
    const { pickerType } = data;

    const getPickerLength = () => {
        return 12;
    };

    const getPickerValue = (i) => {
        return `${12 + i}h`;
    };

    const getInfo = (i) => {
        if (i === 0)
            return (
                <>
                    <span>A </span>
                    <span className="highlight">12</span>
                    <span> hour fast with a </span>
                    <span className="highlight">12</span>
                    <span> hour feeding window.</span>
                </>
            );
        else if (i === 1)
            return (
                <>
                    <span>A </span>
                    <span className="highlight">13</span>
                    <span> hour fast with an </span>
                    <span className="highlight">11</span>
                    <span> hour feeding window.</span>
                </>
            );
        else if (i === 2)
            return (
                <>
                    <span>A </span>
                    <span className="highlight">14</span>
                    <span> hour fast with a </span>
                    <span className="highlight">10</span>
                    <span> hour feeding window.</span>
                </>
            );
        else if (i === 3)
            return (
                <>
                    <span>A </span>
                    <span className="highlight">15</span>
                    <span> hour fast with a </span>
                    <span className="highlight">9</span>
                    <span> hour feeding window.</span>
                </>
            );
        else if (i === 4)
            return (
                <>
                    <span>A </span>
                    <span className="highlight">16</span>
                    <span> hour fast with an </span>
                    <span className="highlight">8</span>
                    <span> hour feeding window.</span>
                </>
            );
        else if (i === 5)
            return (
                <>
                    <span>A </span>
                    <span className="highlight">17</span>
                    <span> hour fast with a </span>
                    <span className="highlight">7</span>
                    <span> hour feeding window.</span>
                </>
            );
        else if (i === 6)
            return (
                <>
                    <span>An </span>
                    <span className="highlight">18</span>
                    <span> hour fast with a </span>
                    <span className="highlight">6</span>
                    <span> hour feeding window.</span>
                </>
            );
        else if (i === 7)
            return (
                <>
                    <span>A </span>
                    <span className="highlight">19</span>
                    <span> hour fast with a </span>
                    <span className="highlight">5</span>
                    <span> hour feeding window.</span>
                </>
            );
        else if (i === 8)
            return (
                <>
                    <span>A </span>
                    <span className="highlight">20</span>
                    <span> hour fast with a </span>
                    <span className="highlight">4</span>
                    <span> hour feeding window.</span>
                </>
            );
        else if (i === 9)
            return (
                <>
                    <span>A </span>
                    <span className="highlight">21</span>
                    <span> hour fast with a </span>
                    <span className="highlight">3</span>
                    <span> hour feeding window.</span>
                </>
            );
        else if (i === 10)
            return (
                <>
                    <span>A </span>
                    <span className="highlight">22</span>
                    <span> hour fast with a </span>
                    <span className="highlight">2</span>
                    <span> hour feeding window.</span>
                </>
            );
        else if (i === 11)
            return (
                <>
                    <span>A </span>
                    <span className="highlight">23</span>
                    <span> hour fast with a </span>
                    <span className="highlight">1</span>
                    <span> hour feeding window.</span>
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
            color: i > ONLY_ON_OCASIONS ? "#ff5e00" : "initial",
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
        <div className={cn("FastDurationPicker", { last: isLastInteractible })} {...gestureBind()}>
            <div className="pickerContainer">
                {springs.map(
                    (styles, i) =>
                        Math.abs(i - currentElem) < 5 && (
                            <animated.div className={"element"} key={i} style={styles}>
                                {getPickerValue(i)}
                            </animated.div>
                        )
                )}
            </div>
            <div className="infoContainer">
                {getInfo(currentElem)}
                {currentElem > ONLY_ON_OCASIONS && <span className="warning"> Only do this one occasionally.</span>}
            </div>
        </div>
    );
}
