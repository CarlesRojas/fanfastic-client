import SettingsSection from "./SettingsSection";

export default function Settings() {
    return (
        <div className="Settings">
            <h1>{"Settings"}</h1>

            <div className="fastingContainer">
                <SettingsSection />
            </div>
        </div>
    );
}
