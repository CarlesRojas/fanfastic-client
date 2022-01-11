import { useState, useEffect, useRef, Fragment } from "react";
import { useSprings, animated } from "react-spring";
import cn from "classnames";
import Button from "./Button";
import Input from "./Input";
import useCssOneTimeAnimation from "../../hooks/useCssOneTimeAnimation";

const style = (i, currentIndex) => ({
    y: i < currentIndex ? "0rem" : `${i - currentIndex}rem`,
    paddingTop: i < currentIndex ? "1rem" : "10rem",
    zIndex: 10 - (i - currentIndex),
    boxShadow: i < currentIndex ? "0 10px 20px rgba(0, 0, 0, 0)" : "0 10px 20px rgba(0, 0, 0, 0.15)",
});

export default function Cards({ cards, nextStage, prevStage, stages, stageId, stageAnimation }) {
    // #################################################
    //   STATE
    // #################################################

    const [currentCard, setCurrentCard] = useState(0);
    const [error, setError] = useState(false);
    const [springs, api] = useSprings(cards.length, (i) => ({ ...style(i, currentCard) }));
    const [animating, trigger] = useCssOneTimeAnimation(500);
    const stageData = useRef({});

    useEffect(() => {
        api.start((i) => ({ ...style(i, currentCard) }));
    }, [api, currentCard]);

    const handleError = (error) => {
        setError(error);
        trigger();
    };

    // #################################################
    //   HANDLERS
    // #################################################

    const handleAction = (clickAction, data) => {
        setError(false);

        // console.log("");
        // console.log(clickAction);
        // console.log(data);

        // Go to create account
        if (clickAction === "createAccount") nextStage(stages.indexOf("welcome"), stages.indexOf("register"));
        // Go to login
        else if (clickAction === "login") nextStage(stages.indexOf("welcome"), stages.indexOf("login"));
        // Save login email and go to next card
        else if (clickAction === "loginEnterEmail") stageData.current[clickAction] = data;
        // Save login password and go to next stage
        else if (clickAction === "loginEnterPassword") {
            stageData.current[clickAction] = data;

            // ROJAS VALIDATE LOGIN
            nextStage(stages.indexOf("login"), stages.indexOf("loginSuccess"));
        }

        // Save registration email or username and go to next card
        else if (clickAction === "registerEnterEmail" || clickAction === "registerEnterUsername")
            stageData.current[clickAction] = data;
        // Save registration password and go to next stage
        else if (clickAction === "registerEnterPassword") {
            stageData.current[clickAction] = data;
            nextStage(stages.indexOf("register"), stages.indexOf("fast"));
        }

        if (currentCard < cards.length - 1) setCurrentCard((prev) => prev + 1);
    };

    const handleBack = () => {
        setError(false);

        if (currentCard > 0) setCurrentCard((prev) => prev - 1);
        else if (stageId === "register") prevStage(stages.indexOf("register"), stages.indexOf("welcome"));
        else if (stageId === "login") prevStage(stages.indexOf("login"), stages.indexOf("welcome"));
        else if (stageId === "health") prevStage(stages.indexOf("health"), stages.indexOf("fast"));
    };
    // #################################################
    //   RENDER
    // #################################################

    const { title, subtitle, interactibles } = cards[currentCard];

    return (
        <div className={cn("Cards", { shake: animating })}>
            {stageId !== "welcome" &&
                stageId !== "loginSuccess" &&
                stageId !== "registerSuccess" &&
                !(stageId === "fast" && currentCard === 0) && (
                    <div className="backButton" onClick={handleBack}>
                        Back
                    </div>
                )}

            <div className="header">
                <h1>{title}</h1>
                <div className={"subtitle"}>
                    {subtitle}
                    {error && <p>{error}</p>}
                </div>
            </div>

            {springs.map((styles, cardI) => (
                <animated.div
                    className={"interactions"}
                    style={{
                        ...styles,
                        pointerEvents:
                            cardI === currentCard ? stageAnimation.to((v) => (v === "0vw" ? "all" : "none")) : "none",
                    }}
                    key={cardI}
                >
                    {interactibles.map((interactible, i) => {
                        const { type, action } = interactible;

                        if (type === "button")
                            return (
                                <Fragment key={i}>
                                    {i !== 0 && <div className="separation"></div>}
                                    <Button
                                        data={interactible}
                                        handleAction={(data) => handleAction(action, data)}
                                        last={i === interactibles.length - 1}
                                    />
                                </Fragment>
                            );
                        else if (type === "input")
                            return (
                                <Fragment key={i}>
                                    {i !== 0 && <div className="separation"></div>}
                                    <Input
                                        current={cardI === currentCard}
                                        data={interactible}
                                        handleAction={(data) => handleAction(action, data)}
                                        handleError={handleError}
                                        last={i === interactibles.length - 1}
                                        lastCard={cardI === cards.length - 1}
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
