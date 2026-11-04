import Seo from "../../components/Seo";
import Trust from "../../components/Trust";

export default function AcfComponentExample() {
  return (
    <section className="bg-ivory py-12 lg:py-20">
      <Seo
        title="Exemple de composant ACF"
        description="Démonstration d’un composant réutilisable dont les textes sont gérés dans WordPress avec ACF."
      />
      <div className="mx-auto max-w-[900px] px-4 text-center">
        <p className="text-xs font-bold tracking-[0.16em] text-gold uppercase">
          Démonstration ACF
        </p>
        <h1 className="mt-3 font-serif text-3xl font-bold text-forest-deep lg:text-5xl">
          Composant réutilisable
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#444841]">
          Les engagements ci-dessous sont chargés depuis WordPress. Le même
          composant est aussi utilisé sur l’accueil, le catalogue et la page
          contact : modifier ses textes dans ACF les changera à chacun de ces
          endroits.
        </p>
      </div>
      <div className="mt-10 border-y border-line">
        <Trust />
      </div>
    </section>
  );
}