import { useState, useContext, useCallback, useEffect, useRef } from "react";
import { useSprings, animated } from "react-spring";
import { useDrag } from "react-use-gesture";
import cn from "classnames";

import { Utils } from "../../contexts/Utils";

export default function HeightPicker({ data, isLastInteractible, parentData }) {
    const { clamp } = useContext(Utils);
    const { pickerType } = data;

    const getMeterPickerLength = () => {
        return 3;
    };

    const getCentimeterPickerLength = () => {
        return 100;
    };

    const getMeterPickerValue = (i) => {
        return i;
    };

    const getCentimeterPickerValue = (i) => {
        return i;
    };

    // #################################################
    //   SPRING STYLE
    // #################################################

    const meterStyle = useCallback(
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

    const centimeterStyle = useCallback(
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

    const [currentMeter, setCurrentMeter] = useState(parentData.current[pickerType].m);
    const [currentCentimeter, setCurrentCentimeter] = useState(parentData.current[pickerType].cm);

    const [meterSprings, meterApi] = useSprings(getMeterPickerLength(), (i) => ({ ...meterStyle(i, currentMeter) }));
    const [centimeterSprings, centimeterApi] = useSprings(getCentimeterPickerLength(), (i) => ({
        ...centimeterStyle(i, currentCentimeter),
    }));

    useEffect(() => {
        meterApi.start((i) => ({ ...meterStyle(i, currentMeter) }));
    }, [meterApi, currentMeter, meterStyle]);

    useEffect(() => {
        centimeterApi.start((i) => ({ ...centimeterStyle(i, currentCentimeter) }));
    }, [centimeterApi, currentCentimeter, centimeterStyle]);

    // #################################################
    //   GESTURE
    // #################################################

    const initialMeterI = useRef(0);

    // Vertical gesture
    const meterGestureBind = useDrag(
        ({ event, first, down, movement: [, my] }) => {
            event.stopPropagation();

            if (first) initialMeterI.current = currentMeter;

            if (down) {
                const disp = -my;

                // 16 * 1.4 is the distance in px between 2 nums
                const newIndex = clamp(
                    initialMeterI.current + Math.round(disp / (16 * 1.4)),
                    0,
                    getMeterPickerLength() - 1
                );

                setCurrentMeter(newIndex);
            }
        },
        { filterTaps: true, axis: "y" }
    );

    const initialCentimeterI = useRef(0);

    // Vertical gesture
    const centimeterGestureBind = useDrag(
        ({ event, first, down, movement: [, my] }) => {
            event.stopPropagation();

            if (first) initialCentimeterI.current = currentCentimeter;

            if (down) {
                const disp = -my;

                // 16 * 1.4 is the distance in px between 2 nums
                const newIndex = clamp(
                    initialCentimeterI.current + Math.round(disp / (16 * 1.4)),
                    0,
                    getCentimeterPickerLength() - 1
                );

                setCurrentCentimeter(newIndex);
            }
        },
        { filterTaps: true, axis: "y" }
    );

    // #################################################
    //   DATA MANAGEMENT
    // #################################################

    // Save the meter data when the picker changes
    useEffect(() => {
        if (!(pickerType in parentData.current)) return;
        parentData.current[pickerType].m = currentMeter;
    }, [currentMeter, parentData, pickerType]);

    // Save the centimeter data when the picker changes
    useEffect(() => {
        if (!(pickerType in parentData.current)) return;
        parentData.current[pickerType].cm = currentCentimeter;
    }, [currentCentimeter, parentData, pickerType]);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className={cn("HealthPicker", { last: isLastInteractible })}>
            <div className="pickerContainer" {...meterGestureBind()}>
                {meterSprings.map(
                    (styles, i) =>
                        Math.abs(i - currentMeter) < 6 && (
                            <animated.div className={"element"} key={i} style={styles}>
                                {getMeterPickerValue(i)}
                            </animated.div>
                        )
                )}
            </div>
            <div className="infoContainer point">.</div>
            <div className="pickerContainer" {...centimeterGestureBind()}>
                {centimeterSprings.map(
                    (styles, i) =>
                        Math.abs(i - currentCentimeter) < 6 && (
                            <animated.div className={"element"} key={i} style={styles}>
                                {getCentimeterPickerValue(i)}
                            </animated.div>
                        )
                )}
            </div>
            <div className="infoContainer">m</div>
        </div>
    );
}
