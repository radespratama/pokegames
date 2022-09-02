import { BrowserRouter, Routes as Switch, Route } from "react-router-dom";
import { StartScreen, Explore } from "./pages";

export default function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" element={<StartScreen />} />
        <Route path="/explore" element={<Explore />} />
      </Switch>
    </BrowserRouter>
  );
}
