import { BrowserRouter, Route, Routes } from "react-router-dom";


import Homepage from "../component/Homepage";
import Main from "../core/Main";

const Approuter = () => {

    return (
        <>
            <BrowserRouter>
                <Routes>
                   <Route element={<Main/>}>
                        <Route path="/" element={<Homepage/>}/>
                    </Route>
                   
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default Approuter;