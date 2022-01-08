import { createContext } from "react";
export const Data = createContext();

const DataProvider = (props) => {
    // #################################################
    //   DATA
    // #################################################

    return <Data.Provider value={{}}>{props.children}</Data.Provider>;
};

export default DataProvider;
