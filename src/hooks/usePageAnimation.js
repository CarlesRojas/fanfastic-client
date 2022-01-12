import { useState, useCallback, useRef, useEffect } from "react";
import useCssOneTimeAnimation from "./useCssOneTimeAnimation";

export default function usePageAnimation({ pagesIds, pagesContents, containerClass, animationSpeed, animateFirst }) {
    // #################################################
    //   STATE
    // #################################################

    const [pagesVisible, setPagesVisible] = useState(pagesIds.map((_, i) => i === 0));
    const pagesRef = useRef({});

    const updatePagesVisible = (index, newValue) => {
        setPagesVisible((prev) => {
            const newArray = [...prev];
            if (index >= 0 && index < newArray.length) newArray[index] = newValue;
            return newArray;
        });
    };

    // #################################################
    //   NEXT & PREV
    // #################################################

    const page = useRef(0);
    const animationState = useRef({ shouldStartAnimation: false, goingBack: false, animationStarted: false });

    const isFirstPage = useCallback(() => {
        return page.current === 0;
    }, []);

    const isLastPage = useCallback(() => {
        return page.current === pagesIds.length - 1;
    }, [pagesIds]);

    const isInBounds = useCallback(
        (index) => {
            return index >= 0 && index < pagesIds.length;
        },
        [pagesIds]
    );

    const nextPage = useCallback(() => {
        // Save the animation we want to make and instantiate the appearing stage (out of sight)
        animationState.current = { shouldStartAnimation: true, goingBack: false, animationStarted: false };

        if (isLastPage()) {
            updatePagesVisible(page.current, true);
            return false;
        }

        updatePagesVisible(page.current + 1, true);
        return true;
    }, [isLastPage]);

    const prevPage = useCallback(() => {
        // Save the animation we want to make and instantiate the appearing stage (out of sight)
        animationState.current = { shouldStartAnimation: true, goingBack: true, animationStarted: false };

        if (isFirstPage()) {
            updatePagesVisible(page.current, true);
            return false;
        }

        updatePagesVisible(page.current - 1, true);
        return true;
    }, [isFirstPage]);

    // #################################################
    //   ANIMATION
    // #################################################

    const [animating, trigger] = useCssOneTimeAnimation(animationSpeed);

    useEffect(() => {
        const { shouldStartAnimation, goingBack, animationStarted } = animationState.current;
        if (animationStarted || !shouldStartAnimation) return;

        animationState.current = { ...animationState.current, animationStarted: true };

        // Add classes to animate towards the right (Go back)
        if (goingBack) {
            if (isInBounds(page.current)) pagesRef.current[page.current].classList.add("exitGoingBack");
            if (isInBounds(page.current - 1) && !isFirstPage())
                pagesRef.current[page.current - 1].classList.add("enterGoingBack");
        }
        // Add classes to animate towards the left (Go next)
        else {
            if (isInBounds(page.current)) pagesRef.current[page.current].classList.add("exitGoingFordward");
            if (isInBounds(page.current + 1) && !isLastPage())
                pagesRef.current[page.current + 1].classList.add("enterGoingFordward");
        }

        trigger();
    }, [pagesVisible, trigger, isFirstPage, isLastPage, isInBounds]);

    useEffect(() => {
        const { shouldStartAnimation, goingBack } = animationState.current;
        if (animating || !shouldStartAnimation) return;

        // When animation ends -> Deinstantiate the page that left
        const gonePage = page.current;
        page.current = page.current + (goingBack ? -1 : 1);
        animationState.current = { shouldStartAnimation: false, goingBack: false, animationStarted: false };

        updatePagesVisible(gonePage, false);
    }, [animating]);

    const firstRun = useRef(true);
    useEffect(() => {
        if (!firstRun.current) return;
        firstRun.current = false;

        if (animateFirst) pagesRef.current[0].classList.add("enterGoingFordward");
        else pagesRef.current[0].classList.add("center");
    }, [animateFirst]);

    // #################################################
    //   RENDER
    // #################################################

    const renderedPages = pagesIds.map(
        (_, i) =>
            pagesVisible[i] && (
                <div
                    key={i}
                    className={containerClass}
                    style={{ pointerEvents: animating ? "none" : "all" }}
                    ref={(elem) => (pagesRef.current[i] = elem)}
                >
                    {pagesContents[i]}
                </div>
            )
    );

    return [renderedPages, nextPage, prevPage];
}
