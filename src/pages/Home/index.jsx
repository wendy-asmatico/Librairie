import "./index.css";

import Hero from "../../components/HomeSlider/Hero"; // Ton nouveau composant
import Trust from "../../components/Trust";
import HomeCategories from "../../components/HomeCategory";
import BestSellers from "../../components/BestSellers";
import Gift from "../../components/Gift";
import Newsletter from "../../components/Newsletter/Newsletter";
import StoreLocation from "../../components/StoreLocation";

export default function Home() {
  return (
    <div className="home font-sans">
      <Hero />
      <Trust />
      <HomeCategories />
      <BestSellers />    
      <Gift />
      <Newsletter />
      <StoreLocation />
    </div>
  );
}