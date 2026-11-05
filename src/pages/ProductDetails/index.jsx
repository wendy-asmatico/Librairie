import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchProductByIdThunk } from "../../thunkActionsCreator/productsThunks";
import { fetchCategoriesThunk } from "../../thunkActionsCreator/categoriesThunks";
import Product from "../../components/Product";
import SimilarProducts from "../../components/SimilarProducts";
import Review from "../../components/Review";
import Loader from "../../components/Loader";


export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.items || []);

  const { list, singleProduct, loadingSingle } = useSelector(
    (state) => state.products,
  );
  const productFromList = list?.data?.find(
    (p) => p.id?.toString() === id?.toString(),
  );

  useEffect(() => {
    if (id && !productFromList) {
      dispatch(fetchProductByIdThunk(id));
      dispatch(fetchCategoriesThunk());
    }
  }, [id, productFromList, dispatch]);

  const productToDisplay = productFromList || singleProduct;

  if (loadingSingle && !productToDisplay) {
    return <Loader size="lg" />;
  }

  if (!productToDisplay) {
    return <p className="not-found-state">Aucun produit trouvé.</p>;
  }

  const categoryName = productToDisplay?.categories?.[0]?.name;
  const matchedCategory = categories.find(
    (cat) => cat.name?.toString() === categoryName?.toString(),
  );
  const bg = matchedCategory?.image?.src;

  return (
    <main>
      <div className="product-details-page ">
        <Product product={productToDisplay} />
        <SimilarProducts
          currentProduct={productToDisplay}
          reduxProducts={list?.data}
        />
        <Review productId={productToDisplay.id} />

        <div
          className="category-bg"
          style={{ "--cat-bg": bg ? `url(${bg})` : "none" }}
        ></div>
      </div>
    </main>
  );
}
