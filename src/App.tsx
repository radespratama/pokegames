import { BrowserRouter, Routes as Switch, Route } from "react-router-dom";
import { StartScreen } from "./pages";

export default function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" element={<StartScreen />} />
      </Switch>
    </BrowserRouter>
  );
}
