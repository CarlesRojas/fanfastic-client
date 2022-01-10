import Historic from "../Historic";
import Home from "../Home";
import Settings from "../Settings";

export default function DesktopLayout() {
    return (
        <div className="DesktopLayout">
            <Historic />
            <Home />
            <Settings />
        </div>
    );
}
