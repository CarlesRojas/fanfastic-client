import { useRef } from "react";
import useGlobalState from "../../hooks/useGlobalState";
import useThrottle from "../../hooks/useThrottle";

import Page from "./Page";
import Historic from "../Historic";
import Home from "../Home";
import Settings from "../Settings";

export default function MobileLayout() {
    const [currentPage, setCurrentPage] = useGlobalState("currentPage");

    const pages = useRef([
        {
            id: "historic",
            page: <Historic />,
        },
        {
            id: "home",
            page: <Home />,
        },
        {
            id: "settings",
            page: <Settings />,
        },
    ]);

    const handleClick = useThrottle(() => {
        setCurrentPage((prev) => (prev === "auth" ? "home" : "auth"));
    }, 500);

    return (
        <div className="MobileLayout">
            {pages.current.map(({ id, page }) => (
                <Page visible={currentPage === id} key={id}>
                    {page}
                </Page>
            ))}

            <div className="change" onClick={handleClick}></div>
        </div>
    );
}
