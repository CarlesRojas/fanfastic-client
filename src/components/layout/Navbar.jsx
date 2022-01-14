import { useState, useEffect, Fragment, useContext, useCallback } from "react";
import cn from "classnames";
import SVG from "react-inlinesvg";

import HomeIcon from "../../resources/icons/logo.svg";
import HistoryIcon from "../../resources/icons/history.svg";
import SettingsIcon from "../../resources/icons/settings.svg";

const PAGES = [
    {
        name: "Home",
        icon: HomeIcon,
    },
    {
        name: "History",
        icon: HistoryIcon,
    },
    {
        name: "Settings",
        icon: SettingsIcon,
    },
];

export default function Navbar({ setPage, currentPage }) {
    // #################################################
    //   STATE
    // #################################################

    const [selected, updateSelected] = useState(currentPage.current);

    const setSelected = (newIndex) => {
        if (selected === newIndex) return;

        currentPage.current = newIndex;
        updateSelected(newIndex);
        setPage(newIndex);
    };

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className={"Navbar"}>
            {PAGES.map(({ name, icon }, i) => (
                <div
                    className={cn("container", { selected: selected === i }, { middle: i === 1 }, `navbar${name}`)}
                    onClick={() => setSelected(i)}
                    key={name}
                >
                    <SVG className={cn("icon", `navbar${name}`)} src={icon} />
                    <p className={cn("name", `navbar${name}`)}>{name}</p>
                </div>
            ))}
        </div>
    );
}
