import type { Route } from "./+types/home";
import Home from "../pages/Home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "StalkExchange — Stock Metrics" },
    { name: "description", content: "Peter Lynch–style stock metrics. Growth Rate, P/E, and PEG in one place." },
  ];
}

export default function HomeRoute() {
  return <Home />;
}
