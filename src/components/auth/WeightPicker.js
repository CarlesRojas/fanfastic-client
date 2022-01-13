import { useState, useContext, useCallback, useEffect, useRef } from "react";
import { useSprings, animated } from "react-spring";
import { useDrag } from "react-use-gesture";
import cn from "classnames";

import { Utils } from "../../contexts/Utils";

export default function WeightPicker({ data, isLastInteractible, parentData }) {
    const { clamp } = useContext(Utils);
    const { pickerType } = data;

    const getKilogramPickerLength = () => {
        return pickerType === "objectiveWeight" ? parentData.current["weight"].kg : 251;
    };

    const getDecigramPickerLength = () => {
        return 10;
    };

    const getKilogramPickerValue = (i) => {
        return i;
    };

    const getDecigramPickerValue = (i) => {
        return i;
    };

    // #################################################
    //   SPRING STYLE
    // #################################################

    const kilogramStyle = useCallback(
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

    const decigramStyle = useCallback(
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

    const [currentKilogram, setCurrentKilogram] = useState(
        pickerType === "objectiveWeight" && parentData.current[pickerType].kg === -2
            ? Math.max(0, getKilogramPickerLength() - 5)
            : pickerType === "objectiveWeight" && parentData.current[pickerType].kg >= getKilogramPickerLength()
            ? Math.max(0, getKilogramPickerLength() - 5)
            : parentData.current[pickerType].kg
    );
    const [currentDecigram, setCurrentDecigram] = useState(
        pickerType === "objectiveWeight" && parentData.current[pickerType].dg === -2
            ? parentData.current["weight"].dg
            : parentData.current[pickerType].dg
    );

    const [kilogramSprings, kilogramApi] = useSprings(getKilogramPickerLength(), (i) => ({
        ...kilogramStyle(i, currentKilogram),
    }));
    const [decigramSprings, decigramApi] = useSprings(getDecigramPickerLength(), (i) => ({
        ...decigramStyle(i, currentDecigram),
    }));

    useEffect(() => {
        kilogramApi.start((i) => ({ ...kilogramStyle(i, currentKilogram) }));
    }, [kilogramApi, currentKilogram, kilogramStyle]);

    useEffect(() => {
        decigramApi.start((i) => ({ ...decigramStyle(i, currentDecigram) }));
    }, [decigramApi, currentDecigram, decigramStyle]);

    // #################################################
    //   GESTURE
    // #################################################

    const initialKilogramI = useRef(0);

    // Vertical gesture
    const kilogramGestureBind = useDrag(
        ({ event, first, down, movement: [, my] }) => {
            event.stopPropagation();

            if (first) initialKilogramI.current = currentKilogram;

            if (down) {
                const disp = -my;

                // 16 * 1.4 is the distance in px between 2 nums
                const newIndex = clamp(
                    initialKilogramI.current + Math.round(disp / (16 * 1.4)),
                    0,
                    getKilogramPickerLength() - 1
                );

                setCurrentKilogram(newIndex);
            }
        },
        { filterTaps: true, axis: "y" }
    );

    const initialDecigramI = useRef(0);

    // Vertical gesture
    const decigramGestureBind = useDrag(
        ({ event, first, down, movement: [, my] }) => {
            event.stopPropagation();

            if (first) initialDecigramI.current = currentDecigram;

            if (down) {
                const disp = -my;

                // 16 * 1.4 is the distance in px between 2 nums
                const newIndex = clamp(
                    initialDecigramI.current + Math.round(disp / (16 * 1.4)),
                    0,
                    getDecigramPickerLength() - 1
                );

                setCurrentDecigram(newIndex);
            }
        },
        { filterTaps: true, axis: "y" }
    );

    // #################################################
    //   DATA MANAGEMENT
    // #################################################

    // Save the kilogram data when the picker changes
    useEffect(() => {
        if (!(pickerType in parentData.current)) return;
        parentData.current[pickerType].kg = currentKilogram;
    }, [currentKilogram, parentData, pickerType]);

    // Save the decigram data when the picker changes
    useEffect(() => {
        if (!(pickerType in parentData.current)) return;
        parentData.current[pickerType].dg = currentDecigram;
    }, [currentDecigram, parentData, pickerType]);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className={cn("HealthPicker", { last: isLastInteractible })}>
            <div className="pickerContainer" {...kilogramGestureBind()}>
                {kilogramSprings.map(
                    (styles, i) =>
                        Math.abs(i - currentKilogram) < 6 && (
                            <animated.div className={"element"} key={i} style={styles}>
                                {getKilogramPickerValue(i)}
                            </animated.div>
                        )
                )}
            </div>
            <div className="infoContainer point">.</div>
            <div className="pickerContainer" {...decigramGestureBind()}>
                {decigramSprings.map(
                    (styles, i) =>
                        Math.abs(i - currentDecigram) < 6 && (
                            <animated.div className={"element"} key={i} style={styles}>
                                {getDecigramPickerValue(i)}
                            </animated.div>
                        )
                )}
            </div>
            <div className="infoContainer">kg</div>
        </div>
    );
}
