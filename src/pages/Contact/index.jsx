import { useRef } from "react";
import { useSearchParams } from "react-router-dom";

import ContactHero from "../../components/ContactHero";
import Trust from "../../components/Trust";
import ContactForm, { SUBJECTS } from "../../components/ContactForm";
import ContactInfo from "../../components/ContactInfo";
import ContactShop from "../../components/ContactShop";

// Page Contact — maquette « Contact — ordinateur » de Lisa (node 175:2)
export default function Contact() {
  const [params] = useSearchParams();
  const formRef = useRef(null);

  // /contact?objet=devis présélectionne l'objet de la demande
  const objet = params.get("objet");
  const initialSubject = SUBJECTS.some((s) => s.value === objet) ? objet : "commande";

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    formRef.current?.querySelector("input[name=lastname]")?.focus({ preventScroll: true });
  };

  return (
    <div className="bg-ivory">
      <ContactHero onWrite={scrollToForm} />
      <Trust />

      <section className="px-4 pt-10 pb-12 lg:px-12 lg:pt-16 lg:pb-[72px]">
        <div className="mx-auto grid max-w-[1184px] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <ContactForm key={initialSubject} ref={formRef} initialSubject={initialSubject} />
          <ContactInfo />
        </div>
      </section>

      <ContactShop />
    </div>
  );
}
