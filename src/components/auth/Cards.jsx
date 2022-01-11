import { useState, useEffect, Fragment, useContext } from "react";
import { useSprings, animated } from "react-spring";
import cn from "classnames";
import Button from "./Button";
import Input from "./Input";
import { Events } from "../../contexts/Events";
import useCssOneTimeAnimation from "../../hooks/useCssOneTimeAnimation";
import useThrottle from "../../hooks/useThrottle";

const style = (i, currentIndex) => ({
    y: i < currentIndex ? "0rem" : `${i - currentIndex}rem`,
    paddingTop: i < currentIndex ? "1rem" : "10rem",
    zIndex: 10 - (i - currentIndex),
    boxShadow: i < currentIndex ? "0 10px 20px rgba(0, 0, 0, 0)" : "0 10px 20px rgba(0, 0, 0, 0.15)",
});

export default function Cards({ cards, stageId }) {
    const { emit } = useContext(Events);

    // #################################################
    //   STATE
    // #################################################

    const [currentCard, setCurrentCard] = useState(0);
    const [error, setError] = useState(false);
    const [springs, api] = useSprings(cards.length, (i) => ({ ...style(i, currentCard) }));
    const [animating, trigger] = useCssOneTimeAnimation(500);

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

    const nextCard = useThrottle((action, data) => {
        setError(false);

        if (currentCard < cards.length - 1) setCurrentCard((prev) => prev + 1);
        else emit("onNextStage", { stageId, action, data });
    }, 500);

    const prevCard = useThrottle(() => {
        setError(false);

        if (currentCard > 0) setCurrentCard((prev) => prev - 1);
        else emit("onPrevStage", { stageId });
    }, 500);

    // #################################################
    //   RENDER
    // #################################################

    const { title, subtitle, interactibles } = cards[currentCard];

    return (
        <div className={cn("Cards", { shake: animating })}>
            {stageId !== "welcome" && stageId !== "loginSuccess" && stageId !== "registerSuccess" && (
                <div className="backButton" onClick={prevCard}>
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
                    style={{ ...styles, pointerEvents: cardI === currentCard ? "inherit" : "none" }}
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
                                        nextCard={(data) => nextCard(action, data)}
                                        last={i === interactibles.length - 1}
                                    />
                                </Fragment>
                            );
                        else if (type === "input")
                            return (
                                <Fragment key={i}>
                                    {i !== 0 && <div className="separation"></div>}
                                    <Input
                                        data={interactible}
                                        nextCard={(data) => nextCard(action, data)}
                                        current={cardI === currentCard}
                                        handleError={handleError}
                                        lastCard={cardI === cards.length - 1}
                                        lastInteractible={i === interactibles.length - 1}
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
