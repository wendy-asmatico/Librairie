import "./index.css";

import Hero from "../../components/HomeSlider/Hero"; // Ton nouveau composant
import Trust from "../../components/Trust";
import PageContent from "../../components/PageContent";
import Advantages from "../../components/Advantages";
import HomeCategories from "../../components/HomeCategory";

export default function Home() {
  return (
    <div className="home font-sans">
      <Hero />
      <Trust />
      <HomeCategories />
      <PageContent slug="home" />
      <div className="apropos-wrapper">
        <PageContent slug="a-propos" />
        <Advantages />
      </div>
    </div>
  );
}