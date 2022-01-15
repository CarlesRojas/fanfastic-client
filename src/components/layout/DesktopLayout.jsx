import Historic from "../Historic";
import Home from "../home/Home";
import Settings from "../Settings";

export default function DesktopLayout() {
    return (
        <div className="DesktopLayout">
            <div className="grid">
                <div className="sectionContainer">
                    <Historic />
                </div>

                <div className="sectionContainer">
                    <Home />
                </div>

                <div className="sectionContainer">
                    <Settings />
                </div>
            </div>
        </div>
    );
}
