import { createContext, useEffect } from "react";
import cn from "classnames";
import { useMediaQuery } from "react-responsive";
import { isMobile as isTouchScreen } from "react-device-detect";

export const MediaQuery = createContext();
const MediaQueryProvider = (props) => {
    const isDesktop = useMediaQuery({ minWidth: 1100 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1100 });
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const isLandscape = useMediaQuery({ orientation: "landscape" });
    const isNotTouchscreen = !isTouchScreen;

    const queryClasses = () => {
        return cn({ isDesktop }, { isTablet }, { isLandscape }, { isNotTouchscreen });
    };

    useEffect(() => {
        isDesktop ? document.body.classList.add("isDesktop") : document.body.classList.remove("isDesktop");
        isTablet ? document.body.classList.add("isTablet") : document.body.classList.remove("isTablet");
        isLandscape ? document.body.classList.add("isLandscape") : document.body.classList.remove("isLandscape");
        isNotTouchscreen
            ? document.body.classList.add("isNotTouchscreen")
            : document.body.classList.remove("isNotTouchscreen");
    }, [isDesktop, isTablet, isLandscape, isNotTouchscreen]);

    return (
        <MediaQuery.Provider
            value={{
                // MEDIA QUERIES
                isDesktop,
                isTablet,
                isMobile,
                isLandscape,
                isNotTouchscreen,

                // CLASSES
                queryClasses,
            }}
        >
            {props.children}
        </MediaQuery.Provider>
    );
};

export default MediaQueryProvider;
