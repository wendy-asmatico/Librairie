import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPageThunk } from "../../thunkActionsCreator/pagesThunks";
import Loader from "../Loader";

export default function PageContent({ slug }) {
  const page = useSelector((state) => state.pages.items[slug]);
  const loading = useSelector((state) => state.pages.loading);
  const error = useSelector((state) => state.pages.error);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPageThunk(slug));
  }, [dispatch, slug]);

  if (!page && error) return <p>{error}</p>;
  if (!page || loading) return <Loader size="lg" />;

  const title = page.title?.rendered ?? "";
  const content = page.acf?.legal_content || page.content?.rendered || "";
  return (
    <div className="mx-auto max-w-4xl px-gutter py-12">
      <h1 className="mb-8 font-serif text-3xl font-semibold text-forest sm:text-4xl" dangerouslySetInnerHTML={{ __html: title }} />
      {content ? (
        <div className="prose max-w-none text-ink" dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <p>Le contenu de cette page n’est pas encore disponible.</p>
      )}
    </div>
  );
}
