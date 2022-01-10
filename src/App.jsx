import { useContext, useEffect } from "react";
import { API } from "./contexts/API";

export default function App() {
    const { subscribeToPuhsNotifications, login } = useContext(API);

    const handleSubscribe = async () => {
        await subscribeToPuhsNotifications();
    };

    useEffect(() => {
        login("carles@test.com", "Carles1234");
    }, [login]);

    return (
        <div className="App">
            <div
                className="subscribe"
                style={{ width: "400px", height: "100px", background: "green" }}
                onClick={handleSubscribe}
            >
                Subscribe
            </div>
        </div>
    );
}
