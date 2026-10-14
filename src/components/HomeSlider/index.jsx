
import arrowLeft from "./arrow_left.png";
import arrowRight from "./arrow_right.png";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchSpotlightProductsThunk } from "../../thunkActionsCreator/spotlightThunks";

import ProductCard from "../ProductCard";
import Loader from "../Loader";

export default function HomeSlider() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.spotlight);
  const sliders = list?.data || [];

  const [selected, setSelected] = useState(0);
  const [cooldown, setCooldown] = useState(false);
  const touchStartX = useRef(0);

  useEffect(() => {
    dispatch(
      fetchSpotlightProductsThunk({
        orderby: "popularity",
        order: "desc",
        page: 1,
        per_page: 15,
      }),
    );
  }, [dispatch]);

  const sortedSlider = useMemo(() => {
    if (!sliders || sliders.length === 0) return [];
    let listClone = structuredClone(sliders);
    if (listClone.length === 2) {
      listClone = listClone.concat(structuredClone(listClone));
    }

    return listClone.map((item, index) => ({
      ...item,
      sliderIndex: index,
    }));
  }, [sliders]);

  const length = sortedSlider.length;
  const previousIndex = (selected - 1 + length) % length;
  const nextIndex = (selected + 1) % length;

  const previousPicture = () => {
    if (cooldown || length <= 1) return;
    setCooldown(true);
    setSelected((prev) => (prev - 1 + length) % length);
    setTimeout(() => setCooldown(false), 1000);
  };

  const nextPicture = () => {
    if (cooldown || length <= 1) return;
    setCooldown(true);
    setSelected((prev) => (prev + 1) % length);
    setTimeout(() => setCooldown(false), 1000);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX.current - 50) {
      nextPicture();
    } else if (touchEndX > touchStartX.current + 50) {
      previousPicture();
    }
  };

  const getSlideProps = (index) => {
    if (index === selected) {
      return {
        className: `slMax sl b${index} selected`,
        style: { zIndex: 2, opacity: 1 },
      };
    }
    if (index === previousIndex) {
      return {
        className: `slMax sl b${index} previous`,
        style: { zIndex: 0, opacity: 1 },
      };
    }
    if (index === nextIndex) {
      return {
        className: `slMax sl b${index} next`,
        style: { zIndex: 2, opacity: 1 },
      };
    }

    /* SI 5 OU PLUS FAVORIS PERMETTRE NEXT NEXT ET PREV PREV */
    if (length < 5) {
      return {
        className: `slMax sl b${index}`,
        style: { zIndex: 0, opacity: 0 },
      };
    }

    if ((previousIndex === 0 && index === length) || index < previousIndex) {
      return {
        className: `slMax sl b${index} prevPrev`,
        style: { zIndex: 0, opacity: 0 },
      };
    }
    if ((nextIndex === length - 1 && index === 0) || index > nextIndex) {
      return {
        className: `slMax sl b${index} nextNext`,
        style: { zIndex: 0, opacity: 0 },
      };
    }

    return {
      className: `slMax sl b${index}`,
      style: { zIndex: 0, opacity: 0 },
    };
  };

  if (loading) return <Loader />;
  if (length === 0) return null;

  const isOriginallyTwoItems = sliders.length === 2;
  const dotCount = isOriginallyTwoItems ? 2 : length;
  const activeDotIndex = isOriginallyTwoItems ? selected % 2 : selected;

  return (
    <div
      className="sliderField sliderContainer"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="inner">
        {sortedSlider.map((slide) => {
          const { className, style } = getSlideProps(slide.sliderIndex);
          return (
            <div key={slide.sliderIndex} className={className} style={style}>
              <ProductCard product={slide} />
            </div>
          );
        })}
      </div>

      {length > 1 && (
        <div className="arrowAndCounter">
          <button
            type="button"
            tabIndex={0}
            className={`buttonArrow arrowLeft ${cooldown ? "cooldown" : ""}`}
            onClick={previousPicture}
            aria-label="Diapositive précédente"
          >
            <img
              className="leftArrow"
              src={arrowLeft}
              alt="flèche vers la gauche"
            />
          </button>

          <button
            type="button"
            tabIndex={0}
            className={`buttonArrow arrowRight ${cooldown ? "cooldown" : ""}`}
            onClick={nextPicture}
            aria-label="Diapositive suivante"
          >
            <img
              className="rightArrow"
              src={arrowRight}
              alt="flèche vers la droite"
            />
          </button>

          <div className="counter">
            {Array.from({ length: dotCount }).map((_, dotIndex) => (
              <div
                key={dotIndex}
                className={`dot d${dotIndex} ${
                  dotIndex === activeDotIndex ? "dotSelected" : ""
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
