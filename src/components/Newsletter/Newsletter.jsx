import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="bg-[#EEF4EC] py-16 px-6 font-sans text-center">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        
        {/* Pastille Icône Enveloppe */}
        <div className="w-12 h-12 rounded-full bg-[#B1D2AA]/60 flex items-center justify-center text-[#2A3B28] mb-6 shadow-2xs">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Titre Serif */}
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-[#B1D2AA] leading-tight mb-4 tracking-tight">
          Recevez Nos Lumières & Inspirations Littéraires
        </h2>

        {/* Paragraphe descriptif */}
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-2xl mb-8">
          Recevez chaque mois nos sélections littéraires exclusives, les alertes d'arrivages de livres précieux en arabe et français, et des privilèges réservés aux membres de notre communauté.
        </p>

        {/* Formulaire */}
        {submitted ? (
          <div className="bg-[#B1D2AA]/30 text-[#2A3B28] px-6 py-3.5 rounded-2xl font-bold text-sm">
            Merci ! Votre inscription est bien enregistrée.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col sm:flex-row items-center gap-3 mb-4">
            <input
              type="email"
              required
              placeholder="Votre adresse email personnelle..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full flex-1 bg-white border border-gray-200/80 rounded-xl px-5 py-3.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#B1D2AA] transition-colors shadow-2xs"
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#B1D2AA] hover:bg-[#a1c49a] text-[#2A3B28] font-bold text-sm px-7 py-3.5 rounded-xl transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              S'inscrire
            </button>
          </form>
        )}

        {/* Cadenas et mention légale */}
        <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1.5 mt-1">
          <span>🔒</span>
          <span>Vos données restent strictly confidentielles. Désinscription en 1 clic sans condition.</span>
        </p>

      </div>
    </section>
  );
}