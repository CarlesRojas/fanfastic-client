import Historic from "../historic/Historic";
import Fasting from "../fasting/Fasting";
import Settings from "../settings/Settings";
import Weight from "../weight/Weight";
import Popup from "./Popup";

export default function DesktopLayout() {
    return (
        <div className="DesktopLayout">
            <div className="grid">
                <div className="sectionContainer">
                    <Historic />
                </div>

                <div className="sectionContainer">
                    <Fasting />
                    <Weight />
                </div>

                <div className="sectionContainer">
                    <Settings />
                </div>
            </div>

            <Popup />
        </div>
    );
}
