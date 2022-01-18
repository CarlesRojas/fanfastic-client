import { useState } from "react";
import cn from "classnames";
import SVG from "react-inlinesvg";
import useThrottle from "../../hooks/useThrottle";

import FastingIcon from "../../resources/icons/logo.svg";
import WeightIcon from "../../resources/icons/weight.svg";
import HistoryIcon from "../../resources/icons/history.svg";
import SettingsIcon from "../../resources/icons/settings.svg";

const PAGES = [
    {
        name: "Fasting",
        icon: FastingIcon,
    },
    {
        name: "Weight",
        icon: WeightIcon,
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

    const setSelected = useThrottle((newIndex) => {
        if (selected === newIndex) return;

        currentPage.current = newIndex;
        updateSelected(newIndex);
        setPage(newIndex);
    }, 300);

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
