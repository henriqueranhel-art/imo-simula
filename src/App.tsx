import { BrowserRouter, Routes, Route } from "react-router-dom";
import ImoSimula from "./ImoSimula";
import ComoFunciona from "./ComoFunciona";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ImoSimula />} />
        <Route path="/como-funciona" element={<ComoFunciona />} />
      </Routes>
    </BrowserRouter>
  );
}
