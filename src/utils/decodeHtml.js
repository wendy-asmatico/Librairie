export function decodeHtml(html) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  return textarea.value;
}

// Réduit un fragment HTML (message d'erreur WooCommerce, nom de produit...) à
// son texte : balises retirées, entités décodées, aucun script exécuté.
export function htmlToText(html) {
  return (
    new DOMParser().parseFromString(String(html ?? ""), "text/html").body
      .textContent ?? ""
  );
}
