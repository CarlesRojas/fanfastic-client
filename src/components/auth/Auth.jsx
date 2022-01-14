import { useCallback, useEffect, useContext, useState } from "react";
import usePageAnimation from "../../hooks/usePageAnimation";
import Card from "./Card";
import Login from "./Login";
import Register from "./Register";

import { Events } from "../../contexts/Events";

const PARENT_ID = "welcome";
const STAGES = ["welcome"];
const CARDS = {
    welcome: [
        {
            title: "Hi, welcome to Fanfastic!",
            subtitle: "What do you want to do?",
            interactiblesHeight: 9,
            interactibles: [
                { type: "button", action: "register", content: "Create and account" },
                { type: "button", action: "login", content: "Log in" },
            ],
        },
    ],
};

export default function Auth({ setLoggedIn }) {
    const { sub, unsub } = useContext(Events);

    const [showNextPages, setShowNextPages] = useState({ register: false, login: false });

    // #################################################
    //   PAGE ANIMATION
    // #################################################

    const animationSpeed = 400;
    const content = STAGES.map((id) => (
        <Card cardPhases={CARDS[id]} canGoBack={false} registrationData={{}} parentId={PARENT_ID} />
    ));
    const [renderedPages, nextPage, prevPage] = usePageAnimation({
        pagesIds: STAGES,
        pagesContents: content,
        containerClass: "lateralPages",
        animationSpeed,
        animateFirst: false,
        initialPage: 0,
    });

    // #################################################
    //   HANDLERS
    // #################################################

    const handleActionDone = useCallback(({ callerParentId, action }) => {
        if (callerParentId !== PARENT_ID) return;

        if (action === "register") setShowNextPages({ register: true, login: false });
        else if (action === "login") setShowNextPages({ register: false, login: true });
    }, []);

    const handleNextStage = useCallback(
        (callerParentId) => {
            if (callerParentId !== PARENT_ID) return;
            nextPage();
        },
        [nextPage]
    );

    const handlePrevStage = useCallback(
        (callerParentId) => {
            if (callerParentId !== PARENT_ID) return;
            let timeout = null;

            prevPage();
            timeout = setTimeout(() => {
                setShowNextPages({ register: false, login: false });
            }, animationSpeed);

            return () => {
                clearTimeout(timeout);
            };
        },
        [prevPage]
    );

    // #################################################
    //   EVENTS
    // #################################################

    useEffect(() => {
        sub("onNextStage", handleNextStage);
        sub("onPrevStage", handlePrevStage);
        sub("onActionDone", handleActionDone);

        return () => {
            unsub("onNextStage", handleNextStage);
            unsub("onPrevStage", handlePrevStage);
            unsub("onActionDone", handleActionDone);
        };
    }, [handleNextStage, handlePrevStage, handleActionDone, sub, unsub]);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <>
            {renderedPages}
            {showNextPages.login && <Login setLoggedIn={setLoggedIn} parentId={PARENT_ID} />}
            {showNextPages.register && <Register setLoggedIn={setLoggedIn} parentId={PARENT_ID} />}
        </>
    );
}
