import { useContext } from "react";
import FastingSection from "./FastingSection";

import { Data } from "../../contexts/Data";

export default function Fasting() {
    const { user } = useContext(Data);
    const { isFasting } = user.current;

    return (
        <div className="Fasting">
            <h1>{isFasting ? "Fasting" : "Breaking fast"}</h1>

            <div className="bigSectionContainer">
                <FastingSection />
            </div>
        </div>
    );
}
