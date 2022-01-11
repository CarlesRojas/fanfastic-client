import { useContext, useEffect, useState } from "react";
import useHistory from "./hooks/useHistory";

import DesktopLayout from "./components/layout/DesktopLayout";
import MobileLayout from "./components/layout/MobileLayout";

import { API } from "./contexts/API";
import { MediaQuery } from "./contexts/MediaQuery";
import Auth from "./components/auth/Auth";

export default function App() {
    const { isLoggedIn } = useContext(API);
    const { isDesktop, isTablet, isLandscape } = useContext(MediaQuery);

    const [loggedIn, setLoggedIn] = useState(null);

    useHistory();

    useEffect(() => {
        const checkLogin = async () => {
            if (await isLoggedIn()) setLoggedIn(true);
            else setLoggedIn(false);
        };

        checkLogin();
    }, [isLoggedIn]);

    if (loggedIn === null) return null;
    else if (loggedIn) return isDesktop || (isTablet && isLandscape) ? <DesktopLayout /> : <MobileLayout />;
    else return <Auth setLoggedIn={setLoggedIn} />;
}
