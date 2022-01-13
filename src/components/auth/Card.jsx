import { useState, useEffect, Fragment, useContext, useCallback } from "react";
import { useSprings, animated } from "react-spring";
import cn from "classnames";
import Button from "./Button";
import Input from "./Input";
import FastDurationPicker from "./FastDurationPicker";
import FastStartTimePicker from "./FastStartTimePicker";
import HeightPicker from "./HeightPicker";
import WeightPicker from "./WeightPicker";
import useCssOneTimeAnimation from "../../hooks/useCssOneTimeAnimation";
import useThrottle from "../../hooks/useThrottle";

import { Events } from "../../contexts/Events";
import ObjectiveWeightButton from "./ObjectiveWeightButton";

export default function Card({ cardPhases, canGoBack, parentData, parentId }) {
    const { emit } = useContext(Events);

    // #################################################
    //   SPRING STYLE
    // #################################################

    const style = useCallback(
        (i, currentIndex) => ({
            y: i < currentIndex ? "0rem" : `${i - currentIndex}rem`,
            marginTop: i < currentIndex ? `${10 - cardPhases[i].interactiblesHeight}rem` : "10rem",
            zIndex: 10 - (i - currentIndex),
            boxShadow: i < currentIndex ? "0 10px 20px rgba(0, 0, 0, 0)" : "0 10px 20px rgba(0, 0, 0, 0.15)",
            filter: i > currentIndex ? `brightness(${100 - (i - currentIndex) * 5}%)` : "brightness(100%)",
        }),
        [cardPhases]
    );
    // #################################################
    //   STATE
    // #################################################

    const [currentPhase, setCurrentPhase] = useState(0);
    const [error, setError] = useState(false);
    const [springs, api] = useSprings(cardPhases.length, (i) => ({ ...style(i, currentPhase) }));
    const [animating, trigger] = useCssOneTimeAnimation(500);

    useEffect(() => {
        api.start((i) => ({ ...style(i, currentPhase) }));
    }, [api, currentPhase, style]);

    const handleError = (error) => {
        setError(error);
        trigger();
    };

    // #################################################
    //   NEXT & PREV
    // #################################################

    const nextPhase = useThrottle((action) => {
        setError(false);
        emit("onActionDone", { callerParentId: parentId, action });

        if (currentPhase < cardPhases.length - 1) {
            setCurrentPhase((prev) => prev + 1);
        } else emit("onNextStage", parentId);
    }, 500);

    const prevPhase = useThrottle(() => {
        setError(false);

        if (currentPhase > 0) setCurrentPhase((prev) => prev - 1);
        else emit("onPrevStage", parentId);
    }, 500);

    // #################################################
    //   RENDER
    // #################################################

    const { title, subtitle } = cardPhases[currentPhase];

    return (
        <div className={cn("Card", { shake: animating })}>
            {canGoBack && (
                <div className="backButton" onClick={prevPhase}>
                    Back
                </div>
            )}

            <div className={cn("header", { noInteractibles: cardPhases[currentPhase].interactibles.length <= 0 })}>
                <h1>{title}</h1>
                <div className={"subtitle"}>
                    {subtitle}
                    {error && <p>{error}</p>}
                </div>
            </div>

            <div className="clip"></div>

            {springs.map((styles, phase) => (
                <animated.div
                    className={"interactions"}
                    style={{ ...styles, pointerEvents: phase === currentPhase ? "inherit" : "none" }}
                    key={phase}
                >
                    {cardPhases[phase].interactibles.map((interactible, i) => {
                        const { type, action } = interactible;

                        if (type === "button")
                            return (
                                <Fragment key={i}>
                                    {i !== 0 && <div className="separation"></div>}
                                    <Button
                                        data={interactible}
                                        nextPhase={() => nextPhase(action)}
                                        isLastInteractible={i === cardPhases[phase].interactibles.length - 1}
                                    />
                                </Fragment>
                            );
                        else if (type === "input")
                            return (
                                <Fragment key={i}>
                                    {i !== 0 && <div className="separation"></div>}
                                    <Input
                                        data={interactible}
                                        nextPhase={() => nextPhase(action)}
                                        isCurrentPhase={phase === currentPhase}
                                        handleError={handleError}
                                        isLastPhase={phase === cardPhases.length - 1}
                                        isLastInteractible={i === cardPhases[phase].interactibles.length - 1}
                                        parentData={parentData}
                                    />
                                </Fragment>
                            );
                        else if (type === "fastDurationPicker")
                            return phase === currentPhase ? (
                                <Fragment key={i}>
                                    {i !== 0 && <div className="separation"></div>}
                                    <FastDurationPicker
                                        data={interactible}
                                        isLastInteractible={i === cardPhases[phase].interactibles.length - 1}
                                        parentData={parentData}
                                    />
                                </Fragment>
                            ) : (
                                <div className="fastPickerReplacement" key={i}></div>
                            );
                        else if (type === "fastStartTimePicker")
                            return phase === currentPhase ? (
                                <Fragment key={i}>
                                    {i !== 0 && <div className="separation"></div>}
                                    <FastStartTimePicker
                                        data={interactible}
                                        isLastInteractible={i === cardPhases[phase].interactibles.length - 1}
                                        parentData={parentData}
                                    />
                                </Fragment>
                            ) : (
                                <div className="fastPickerReplacement" key={i}></div>
                            );
                        else if (type === "heightPicker")
                            return phase === currentPhase ? (
                                <Fragment key={i}>
                                    {i !== 0 && <div className="separation"></div>}
                                    <HeightPicker
                                        data={interactible}
                                        isLastInteractible={i === cardPhases[phase].interactibles.length - 1}
                                        parentData={parentData}
                                    />
                                </Fragment>
                            ) : (
                                <div className="healthPickerReplacement" key={i}></div>
                            );
                        else if (type === "weightPicker")
                            return phase === currentPhase ? (
                                <Fragment key={i}>
                                    {i !== 0 && <div className="separation"></div>}
                                    <WeightPicker
                                        data={interactible}
                                        isLastInteractible={i === cardPhases[phase].interactibles.length - 1}
                                        parentData={parentData}
                                    />
                                </Fragment>
                            ) : (
                                <div className="healthPickerReplacement" key={i}></div>
                            );
                        else if (type === "objectiveWeightButton")
                            return (
                                <Fragment key={i}>
                                    {i !== 0 && <div className="separation"></div>}
                                    <ObjectiveWeightButton
                                        nextPhase={() => nextPhase(action)}
                                        isLastInteractible={i === cardPhases[phase].interactibles.length - 1}
                                        parentData={parentData}
                                    />
                                </Fragment>
                            );
                        else return null;
                    })}
                </animated.div>
            ))}
        </div>
    );
}
