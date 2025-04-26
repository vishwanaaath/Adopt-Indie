import { useMap, useMapEvents } from "react-leaflet";
import { useState } from "react";

function ResetViewControl({ initialPosition, initialZoom }) {
  const map = useMap();
  const [showReset, setShowReset] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(initialPosition);
  const [currentZoom, setCurrentZoom] = useState(initialZoom);

  useMapEvents({
    moveend: () => {
      const newCenter = map.getCenter();
      if (
        newCenter.lat !== currentPosition[0] ||
        newCenter.lng !== currentPosition[1]
      ) {
        setShowReset(true);
      }
    },
    zoomend: () => {
      if (map.getZoom() !== currentZoom) {
        setShowReset(true);
      }
    },
  });

  const resetView = () => {
    map.flyTo(initialPosition, initialZoom);
    setShowReset(false);
  };

  return showReset ? (
    <div className="leaflet-bottom leaflet-right">
      <div className="leaflet-control">
        <button
          onClick={resetView}
          className=" sm:mb-15 mb-40 mr-4 sm:mr-3  bg-white rounded-full   "
          title="Reset to original view">
          <img
            src="./images/locate.svg"
            className="w-[35px] p-1 invert-50 cursor-pointer h-[35px] "
            alt="Reload"
          />
        </button>
      </div>
    </div>
  ) : null;
}

export default ResetViewControl;
