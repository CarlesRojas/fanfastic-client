import { useState, useCallback, useRef, useEffect } from "react";
import useCssOneTimeAnimation from "./useCssOneTimeAnimation";

export default function usePageAnimation({ pagesIds, pagesContents, containerClass }) {
    // #################################################
    //   STATE
    // #################################################

    const [pagesVisible, setPagesVisible] = useState(pagesIds.map((_, i) => i === 0));
    const pagesRef = useRef({});

    const updatePagesVisible = (index, newValue) => {
        setPagesVisible((prev) => {
            const newArray = [...prev];
            newArray[index] = newValue;
            return newArray;
        });
    };

    // #################################################
    //   NEXT & PREV
    // #################################################

    const page = useRef(0);
    const animationState = useRef({ shouldStartAnimation: false, goingBack: false, animationStarted: false });

    const nextPage = useCallback(() => {
        if (page.current >= pagesIds.length - 1) return false;

        // Save the animation we want to make and instantiate the appearing stage (out of sight)
        animationState.current = { shouldStartAnimation: true, goingBack: false, animationStarted: false };

        updatePagesVisible(page.current + 1, true);
        return true;
    }, [pagesIds]);

    const prevPage = useCallback(() => {
        if (page.current <= 0) return false;

        // Save the animation we want to make and instantiate the appearing stage (out of sight)
        animationState.current = { shouldStartAnimation: true, goingBack: true, animationStarted: false };

        updatePagesVisible(page.current - 1, true);
        return true;
    }, []);

    // #################################################
    //   ANIMATION
    // #################################################

    const [animating, trigger] = useCssOneTimeAnimation(400);

    useEffect(() => {
        const { shouldStartAnimation, goingBack, animationStarted } = animationState.current;
        if (animationStarted || !shouldStartAnimation) return;

        animationState.current = { ...animationState.current, animationStarted: true };

        // Add classes to animate towards the right (Go back)
        if (goingBack) {
            pagesRef.current[page.current].classList.add("exitGoingBack");
            pagesRef.current[page.current - 1].classList.add("enterGoingBack");
        }
        // Add classes to animate towards the left (Go next)
        else {
            pagesRef.current[page.current].classList.add("exitGoingFordward");
            pagesRef.current[page.current + 1].classList.add("enterGoingFordward");
        }

        trigger();
    }, [pagesVisible, trigger]);

    useEffect(() => {
        const { shouldStartAnimation, goingBack } = animationState.current;
        if (animating || !shouldStartAnimation) return;

        // When animation ends -> Deinstantiate the page that left
        const gonePage = page.current;
        page.current = page.current + (goingBack ? -1 : 1);
        animationState.current = { shouldStartAnimation: false, goingBack: false, animationStarted: false };

        updatePagesVisible(gonePage, false);
    }, [animating]);

    useEffect(() => {
        // The first page starts in the center
        pagesRef.current[0].classList.add("center");
    }, []);

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
