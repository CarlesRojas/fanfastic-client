import { useRef } from "react";
import usePageAnimation from "../../hooks/usePageAnimation";

import Historic from "../historic/Historic";
import Fasting from "../fasting/Fasting";
import Weight from "../weight/Weight";
import Settings from "../settings/Settings";
import Navbar from "./Navbar";
import Popup from "./Popup";

const STAGES = ["fasting", "weight", "historic", "settings"];

export default function MobileLayout() {
    // #################################################
    //   PAGE ANIMATION
    // #################################################

    const currentPage = useRef(0);

    const animationSpeed = 300;
    const content = STAGES.map((id) => {
        if (id === "fasting") return <Fasting />;
        else if (id === "weight") return <Weight />;
        else if (id === "historic") return <Historic />;
        else if (id === "settings") return <Settings />;
        else return null;
    });
    const [{ renderedPages, setPage }] = usePageAnimation({
        pagesIds: STAGES,
        pagesContents: content,
        containerClass: "mainPages",
        animationSpeed,
        animateFirst: false,
        initialPage: currentPage.current,
    });

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="MobileLayout">
            <div className="mainPagesContent">{renderedPages}</div>

            <Navbar setPage={setPage} currentPage={currentPage} />

            <Popup />
        </div>
    );
}
