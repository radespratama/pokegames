import { BrowserRouter, Routes as Switch, Route } from "react-router-dom";
import { StartScreen, Explore, Detail, MyPokemon } from "./pages";

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
