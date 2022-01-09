import { createContext, useRef } from "react";

const APP_NAME = "fanfastic";

export const Data = createContext();
const DataProvider = (props) => {
    // #################################################
    //   USER INFO
    // #################################################

    const token = useRef(null);
    const user = useRef(null);
    const fastHistoric = useRef({});
    const weightHistoric = useRef({});

    return (
        <Data.Provider
            value={{
                APP_NAME,

                // USER INFO
                token,
                user,
                fastHistoric,
                weightHistoric,
            }}
        >
            {props.children}
        </Data.Provider>
    );
};

export default DataProvider;
