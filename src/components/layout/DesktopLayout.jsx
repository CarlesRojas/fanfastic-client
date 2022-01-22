import Historic from "../historic/Historic";
import FastingWeight from "../fasting/FastingWeight";
import Settings from "../settings/Settings";
import Popup from "./Popup";

export default function DesktopLayout() {
    return (
        <div className="DesktopLayout">
            <div className="grid">
                <div className="sectionContainer">
                    <Historic />
                </div>

                <div className="sectionContainer">
                    <FastingWeight />
                </div>

                <div className="sectionContainer">
                    <Settings />
                </div>
            </div>

            <Popup />
        </div>
    );
}
