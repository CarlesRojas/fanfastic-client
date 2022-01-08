import { createContext, useState, useContext } from "react";
import { Utils } from "./Utils";

export const Language = createContext();

const LANGUAGES = {
    SPANISH: "Español",
    CATALAN: "Català",
    ENGLISH: "English",
};

const SPANISH = {
    name: "Español",
    code: "es",
    locale: "es-ES",

    // APP
};

const ENGLISH = {
    name: "English",
    code: "en",
    locale: "en-US",

    // APP
};

const CATALAN = {
    name: "Català",
    code: "ca",
    locale: "ca-ES",

    // APP
};

const LanguageProvider = (props) => {
    const { getCookie, setCookie } = useContext(Utils);

    // #################################################
    //   LANGUAGE
    // #################################################

    const cookieLanguage = getCookie("fanfastic_lang");
    const [text, set] = useState(
        cookieLanguage === SPANISH.code ? SPANISH : cookieLanguage === CATALAN.code ? CATALAN : ENGLISH
    );

    const setLanguage = (lang) => {
        if (lang === SPANISH.key) {
            set(SPANISH);
            setCookie("fanfastic_lang", SPANISH.code, 365 * 100);
        } else if (lang === ENGLISH.key) {
            set(ENGLISH);
            setCookie("fanfastic_lang", ENGLISH.code, 365 * 100);
        } else if (lang === CATALAN.key) {
            set(CATALAN);
            setCookie("fanfastic_lang", CATALAN.code, 365 * 100);
        }
    };

    // #################################################
    //   INITIAL LOCATION
    // #################################################

    return (
        <Language.Provider
            value={{
                LANGUAGES,
                text,
                setLanguage,
            }}
        >
            {props.children}
        </Language.Provider>
    );
};

export default LanguageProvider;
