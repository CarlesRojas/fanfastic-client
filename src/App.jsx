import { useContext, useEffect, useState, useCallback } from "react";
import useCloseApp from "./hooks/useCloseApp";
import Auth from "./components/auth/Auth";
import DesktopLayout from "./components/layout/DesktopLayout";
import MobileLayout from "./components/layout/MobileLayout";
import Landscape from "./components/layout/Landscape";

import { API } from "./contexts/API";
import { MediaQuery } from "./contexts/MediaQuery";
import { Events } from "./contexts/Events";
import { GlobalState } from "./contexts/GlobalState";

export default function App() {
    const { isLoggedIn } = useContext(API);
    const { isMobile, isTablet, isLandscape } = useContext(MediaQuery);
    const { sub, unsub } = useContext(Events);
    const { set } = useContext(GlobalState);

    const [loggedIn, setLoggedIn] = useState(null);
    const [userInfoReady, setUserInfoReady] = useState(false);

    useCloseApp();

    useEffect(() => {
        const checkLogin = async () => {
            if (await isLoggedIn()) {
                setLoggedIn(true);
                setUserInfoReady(true);
            } else setLoggedIn(false);

            set("loadingVisible", false);
        };

        checkLogin();
    }, [isLoggedIn, loggedIn, set]);

    // #################################################
    //   EVENTS
    // #################################################

    const handleLogout = useCallback(() => {
        setUserInfoReady(false);
        setLoggedIn(null);
    }, []);

    useEffect(() => {
        sub("onLogout", handleLogout);

        return () => {
            unsub("onLoginError", handleLogout);
        };
    }, [handleLogout, sub, unsub]);

    if (loggedIn === null) return null;
    else if (isMobile && isLandscape) return <Landscape />;
    else if (!loggedIn) return <Auth setLoggedIn={setLoggedIn} />;
    else if (loggedIn && userInfoReady)
        return isMobile || (isTablet && !isLandscape) ? <MobileLayout /> : <DesktopLayout />;
    else return null;
}
