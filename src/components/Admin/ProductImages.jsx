export function moveMainImage(images, key) {
  const image = images.find((item) => item.key === key);
  return image ? [image, ...images.filter((item) => item.key !== key)] : images;
}

export default function ProductImages({ images, onAdd, onRemove, onSetMain, disabled = false }) {
  return (
    <fieldset disabled={disabled} className="flex flex-col gap-3 rounded-lg border border-line bg-white p-3 disabled:opacity-70">
      <legend className="px-1 text-sm font-semibold text-ink">Images du produit</legend>
      <p className="text-xs text-muted">La première image est l’image principale. Retirer une image du produit ne la supprime pas de la médiathèque.</p>
      {images.length === 0 ? (
        <p className="text-sm text-muted">Aucune image sélectionnée.</p>
      ) : (
        <ul className="space-y-2">
          {images.map((image, index) => (
            <li key={image.key} className="flex flex-wrap items-center gap-3 rounded-lg border border-line p-2">
              {image.src ? (
                <img src={image.src} alt={image.alt || ""} className="size-14 rounded object-cover" />
              ) : (
                <span className="flex size-14 items-center justify-center rounded bg-ivory text-xs text-muted">Nouvelle</span>
              )}
              <div className="min-w-0 flex-1">
                <p className="break-all text-sm text-ink">{image.name || `Image ${index + 1}`}</p>
                {index === 0 && <p className="text-xs font-semibold text-gold">Image principale</p>}
              </div>
              {index > 0 && <button type="button" onClick={() => onSetMain(image.key)} className="rounded-md border border-line px-2 py-1.5 text-xs font-semibold text-ink hover:bg-ivory" aria-label={`Définir ${image.name || `image ${index + 1}`} comme image principale`}>Définir principale</button>}
              <button type="button" onClick={() => onRemove(image.key)} className="rounded-md border border-[#f0c9c1] px-2 py-1.5 text-xs font-semibold text-[#8a2c1b] hover:bg-[#fff5f2]" aria-label={`Retirer ${image.name || `image ${index + 1}`}`}>Retirer</button>
            </li>
          ))}
        </ul>
      )}
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
        Ajouter des images
        <input type="file" accept="image/*" multiple onChange={onAdd} className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-normal" />
      </label>
    </fieldset>
  );
}
