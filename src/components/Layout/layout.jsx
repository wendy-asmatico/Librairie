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
      <Header />

      <main className="flex-1">
        <Outlet /> 
      </main>

      <Footer />
      <Toast />
      <Modal />
    </div>
  );
}