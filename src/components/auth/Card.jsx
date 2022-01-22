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
import SVG from "react-inlinesvg";

import LoadingIcon from "../../resources/icons/loading.svg";

import { Events } from "../../contexts/Events";
import ObjectiveWeightButton from "./ObjectiveWeightButton";

export default function Card({ cardPhases, canGoBack, parentData, parentId, hideClip }) {
    const { emit, sub, unsub } = useContext(Events);

    // #################################################
    //   SPRING STYLE
    // #################################################

    const style = useCallback(
        (i, currentIndex) => ({
            y: i < currentIndex ? "0rem" : `${i - currentIndex}rem`,
            marginTop: i < currentIndex ? `${10 - cardPhases[i].interactiblesHeight}rem` : "10rem",
            zIndex: 10 - (i - currentIndex),
            boxShadow: i < currentIndex ? "0 10px 20px rgba(0, 0, 0, 0)" : "0 10px 20px rgba(0, 0, 0, 0.15)",
            filter: i > currentIndex ? `brightness(${100 - (i - currentIndex) * 3}%)` : "brightness(100%)",
        }),
        [cardPhases]
    );

    // #################################################
    //   STATE
    // #################################################

    const [loadingDone, setLoadingDone] = useState(false);
    const [currentPhase, setCurrentPhase] = useState(0);
    const [error, setError] = useState(false);
    const [springs, api] = useSprings(cardPhases.length, (i) => ({ ...style(i, currentPhase) }));
    const [animating, trigger] = useCssOneTimeAnimation(500);

    useEffect(() => {
        api.start((i) => ({ ...style(i, currentPhase) }));
    }, [api, currentPhase, style]);

    // #################################################
    //   NEXT & PREV
    // #################################################

    const nextPhase = useThrottle((action) => {
        setError(false);
        emit("onActionDone", { callerParentId: parentId, action });

        if (currentPhase < cardPhases.length - 1) {
            setCurrentPhase((prev) => prev + 1);
        } else if (action !== "completeLogin" && action !== "completeRegistration") emit("onNextStage", parentId);
    }, 500);

    const prevPhase = useThrottle(() => {
        setError(false);

        if (currentPhase > 0) setCurrentPhase((prev) => prev - 1);
        else emit("onPrevStage", parentId);
    }, 500);

    // #################################################
    //   HANDLERS
    // #################################################

    const handleError = useCallback(
        (error) => {
            setError(error);
            trigger();
        },
        [setError, trigger]
    );

    const handleLoginError = useCallback(
        (error) => {
            if (error.includes("email")) setCurrentPhase(0);
            else setCurrentPhase(1);

            setTimeout(() => {
                setError(error);
                trigger();
            }, 300);
        },
        [setError, trigger]
    );

    const handleLoadSuccess = useCallback(() => {
        setLoadingDone(true);
    }, []);

    // #################################################
    //   EVENTS
    // #################################################

    useEffect(() => {
        sub("onLoginError", handleLoginError);
        sub("onRegisterError", handleError);
        sub("onLoadSuccess", handleLoadSuccess);

        return () => {
            unsub("onLoginError", handleLoginError);
            unsub("onRegisterError", handleError);
            unsub("onLoadSuccess", handleLoadSuccess);
        };
    }, [handleLoginError, handleError, handleLoadSuccess, sub, unsub]);

    // #################################################
    //   RENDER
    // #################################################

    const { title, subtitle, loadUntilSuccess, loadingMessage } = cardPhases[currentPhase];

    return (
        <div className={cn("Card", { shake: animating }, { removeEvents: hideClip })}>
            {canGoBack && (
                <div className="backButton" onClick={prevPhase}>
                    Back
                </div>
            )}

            <div className={cn("header", { noInteractibles: cardPhases[currentPhase].interactibles.length <= 0 })}>
                {loadUntilSuccess && !loadingDone ? (
                    <div className={"loadingContainer"}>
                        <p className={"loadingText"}>{loadingMessage}</p>
                        <SVG className={cn("loadingIcon", "spin", "infinite")} src={LoadingIcon} />
                    </div>
                ) : (
                    <>
                        <h1>{title}</h1>
                        <div className={"subtitle"}>
                            {subtitle}
                            {error && <p>{error}</p>}
                        </div>
                    </>
                )}
            </div>

            {!hideClip && <div className="clip"></div>}

            {springs.map((styles, phase) => (
                <animated.div
                    className={"interactions"}
                    style={{ ...styles, pointerEvents: hideClip ? "all" : phase === currentPhase ? "inherit" : "none" }}
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
