import { useState } from "react";
import Button from "./Button";

export default function Cards({ cards, nextStage, prevStage, stages }) {
    const [currentCard, setCurrentCard] = useState(0);

    console.log(cards);

    const { title, subtitle, interactibles } = cards[currentCard];

    const handleClick = (clickAction) => {
        if (clickAction === "createAccount") nextStage(stages.indexOf("welcome"), stages.indexOf("register"));
        else if (clickAction === "login") nextStage(stages.indexOf("welcome"), stages.indexOf("login"));
    };

    return (
        <div className={"Cards"}>
            <div className="header">
                <h1>{title}</h1>
                <p>{subtitle}</p>
            </div>
            <div className="interactions">
                {interactibles.map(({ type, action, content }, i) => {
                    if (type === "button")
                        return (
                            <Button
                                content={content}
                                handleClick={() => handleClick(action)}
                                last={i === interactibles.length - 1}
                                key={i}
                            />
                        );
                    else return null;
                })}
            </div>
        </div>
    );
}
