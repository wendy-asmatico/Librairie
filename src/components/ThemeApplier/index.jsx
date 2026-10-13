import { useEffect } from "react";
import { PALETTE } from "../../brand";

// Applique la palette Maktaba El Hikma (maquettes de Lisa). La palette
// renvoyée par WordPress n'est plus utilisée : elle appartenait à la démo.
function ThemeApplier() {
  useEffect(() => {
    Object.entries(PALETTE).forEach(([name, value]) => {
      document.documentElement.style.setProperty(name, value);
    });
  }, []);

  return null;
}

export default ThemeApplier;
