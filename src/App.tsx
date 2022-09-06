import { BrowserRouter, Routes as Switch, Route } from "react-router-dom";
import loadable from "@loadable/component";
import { StartScreen, MyPokemon } from "./pages";

const Explore = loadable(() => import("./pages/Explore"));
const Detail = loadable(() => import("./pages/Detail"));

export default function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" element={<StartScreen />} />
        <Route path="/pokemons" element={<Explore />} />
        <Route path="/pokemon/:name" element={<Detail />} />
        <Route path="/my-pokemon" element={<MyPokemon />} />
      </Switch>
    </BrowserRouter>
  );
}
