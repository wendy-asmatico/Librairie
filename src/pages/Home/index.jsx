import "./index.css";

import Hero from "../../components/HomeSlider/Hero"; // Ton nouveau composant
import PageContent from "../../components/PageContent";
import Advantages from "../../components/Advantages";

export default function Home() {
  return (
    <div className="home font-sans">
      <Hero />
      <PageContent slug="home" />
      <div className="apropos-wrapper">
        <PageContent slug="a-propos" />
        <Advantages />
      </div>
    </div>
  );
}