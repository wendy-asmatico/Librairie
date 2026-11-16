import { Outlet } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import Toast from "../Toast";
import Modal from "../Modal";
import Seo from "../Seo";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-white text-gray-900">
      <Seo />
      <a href="#contenu-principal" className="sr-only focus:not-sr-only focus:absolute focus:z-[1000] focus:bg-white focus:p-3 focus:text-forest">
        Aller au contenu principal
      </a>
      <Header />

      <main id="contenu-principal" tabIndex={-1} className="flex-1">
        <Outlet /> 
      </main>

      <Footer />
      <Toast />
      <Modal />
    </div>
  );
}