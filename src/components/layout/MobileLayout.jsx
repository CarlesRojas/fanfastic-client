import { useRef } from "react";
import usePageAnimation from "../../hooks/usePageAnimation";

import Historic from "../Historic";
import Home from "../home/Home";
import Settings from "../Settings";
import Navbar from "./Navbar";
import Popup from "./Popup";

const STAGES = ["home", "historic", "settings"];

export default function MobileLayout() {
    // #################################################
    //   PAGE ANIMATION
    // #################################################

    const currentPage = useRef(0);

    const animationSpeed = 300;
    const content = STAGES.map((id) => {
        if (id === "home") return <Home />;
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

    return (
        <div className="MobileLayout">
            <div className="mainPagesContent">{renderedPages}</div>

            <Navbar setPage={setPage} currentPage={currentPage} />

            <Popup />
        </div>
    );
}
