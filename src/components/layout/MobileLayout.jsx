import { useRef } from "react";
import usePageAnimation from "../../hooks/usePageAnimation";
import useThrottle from "../../hooks/useThrottle";

import Historic from "../Historic";
import Home from "../Home";
import Settings from "../Settings";

const STAGES = ["historic", "home", "settings"];

export default function MobileLayout() {
    // #################################################
    //   PAGE ANIMATION
    // #################################################

    const currentPage = useRef(1);

    const animationSpeed = 300;
    const content = STAGES.map((id) => {
        if (id === "historic") return <Historic />;
        else if (id === "home") return <Home />;
        else if (id === "settings") return <Settings />;
        else return null;
    });
    const [renderedPages, nextPage, prevPage, setPage] = usePageAnimation({
        pagesIds: STAGES,
        pagesContents: content,
        containerClass: "mainPages",
        animationSpeed,
        animateFirst: false,
        initialPage: currentPage.current,
    });

    const handleClick = useThrottle(() => {
        if (currentPage.current === 0) {
            currentPage.current = 1;
            setPage(1);
        } else if (currentPage.current === 1) {
            currentPage.current = 2;
            setPage(2);
        } else if (currentPage.current === 2) {
            currentPage.current = 0;
            setPage(0);
        }
    }, 500);

    return (
        <div className="MobileLayout">
            {renderedPages}

            <div className="change" onClick={handleClick}></div>
        </div>
    );
}
