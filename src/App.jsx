import { useContext, useEffect, useState } from "react";

import DesktopLayout from "./components/layout/DesktopLayout";
import MobileLayout from "./components/layout/MobileLayout";

import { API } from "./contexts/API";
import { MediaQuery } from "./contexts/MediaQuery";
import Auth from "./components/auth/Auth";

export default function App() {
    const { isLoggedIn } = useContext(API);
    const { isMobile, isTablet, isLandscape } = useContext(MediaQuery);

    const [loggedIn, setLoggedIn] = useState(null);
    const [userInfoReady, setUserInfoReady] = useState(false);

    useEffect(() => {
        const checkLogin = async () => {
            if (await isLoggedIn()) {
                setLoggedIn(true);
                setUserInfoReady(true);
            } else setLoggedIn(false);
        };

        checkLogin();
    }, [isLoggedIn, loggedIn]);

    if (loggedIn === null) return null;
    else if (!loggedIn) return <Auth setLoggedIn={setLoggedIn} />;
    else if (loggedIn && userInfoReady)
        return isMobile || (isTablet && !isLandscape) ? <MobileLayout /> : <DesktopLayout />;
    else return null;
}
