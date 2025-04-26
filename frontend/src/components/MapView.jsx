import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Link } from "react-router-dom";
import axios from "axios";
import Notification from "./Notification";
import ResetViewControl from "./ResetViewControl";

// Leaflet icon configuration
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const dogIcon = new L.Icon({
  iconUrl: "./images/dog6.svg",
  iconSize: [25, 25],
});

const MapView = () => {
  const [location, setLocation] = useState(null);
  const [dogLocations, setDogLocations] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [isContactAsked, setIsContactAsked] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [notificationImage, setNotificationImage] = useState(null);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [initialPosition, setInitialPosition] = useState(null);
  const [initialZoom, setInitialZoom] = useState(14);
  const [loadingDogs, setLoadingDogs] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user location and nearby dogs
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const userLocation = [pos.coords.latitude, pos.coords.longitude];
          setLocation(userLocation);
          setInitialPosition(userLocation);

          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/dogs/nearby`,
            {
              params: {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                maxDistance: 100000,
                type: selectedColor,
              },
            }
          );

          const dogsWithCoords = response.data.map((dog) => ({
            ...dog,
            lat: dog.location.coordinates[1],
            lon: dog.location.coordinates[0],
          }));

          setDogLocations(dogsWithCoords);
          setError(null);
        } catch (err) {
          console.error("Error fetching dogs:", err);
          setError("Failed to load dog locations");
        } finally {
          setLoadingDogs(false);
        }
      },
      (err) => {
        console.error("Error getting location:", err);
        setLoadingDogs(false);
      }
    );
  }, [selectedColor]);

  const handleColorSelect = (colorName) => {
    setSelectedColor(colorName.name);
    setIsColorDropdownOpen(false);
    setSidebarVisible(false);
    setNotificationMessage(`${colorName.name} filter applied`);
    setNotificationImage(colorName.imageUrl);
  };

  const handleClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleSidebarLeave = (e) => {
    const relatedTarget = e.relatedTarget;
    if (
      !(relatedTarget instanceof Element) ||
      !relatedTarget.closest(".sidebar-container, .edge-detector")
    ) {
      setSidebarVisible(false);
    }
  };

  const dogType = [
    {
      name: "Brown",
      imageUrl:
        "https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/Brown.jpg",
    },
    {
      name: "Black",
      imageUrl:
        "https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/1745406357610-black.jpg",
    },
    {
      name: "White",
      imageUrl:
        "https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/1745406393596-white.jpg",
    },
    {
      name: "Brown and White",
      imageUrl:
        "https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/1745405559806-brown-white.jpg",
    },
    {
      name: "Black and White",
      imageUrl:
        "https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/1745405701747-black-white.jpg",
    },
    {
      name: "Unique",
      imageUrl:
        "https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/1745406502654-spotted-dog.jpg",
    },
  ];

  return (
    <div className="relative w-screen h-screen bg-[#F7F6F1]">
      <Notification
        message={notificationMessage}
        image={notificationImage}
        duration={1500}
      />

      {/* Overlay for closing sidebar on click/touch */}
      {sidebarVisible && (
        <div
          className="fixed inset-0 z-[999]"
          onClick={() => setSidebarVisible(false)}
          onTouchStart={() => setSidebarVisible(false)}
        />
      )}

      {/* Left edge detection zone with indicator */}
      {location && (
        <div
          className="edge-detector fixed left-0 top-0 h-full w-4 z-[1000] transition-all duration-200"
          onMouseEnter={() => setSidebarVisible(true)}
          onMouseLeave={handleSidebarLeave}>
          <div
            className={`absolute top-1/2 -translate-y-1/2 left-1 w-8 h-8 invert-50 rounded-lg   flex items-center justify-center cursor-pointer  transition-all duration-300 ${
              sidebarVisible
                ? "opacity-0 -translate-x-8"
                : "opacity-100 translate-x-2 hover:translate-x-3"
            }`}>
            <img src="./images/left.svg" alt="" />
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`sidebar-container fixed left-0 top-0 h-full w-[230px] bg-[#fff] shadow-xl transform transition-transform duration-300 z-[1001] ${
          sidebarVisible ? "translate-x-0" : "-translate-x-full"
        }`}
        onMouseEnter={() => setSidebarVisible(true)}
        onMouseLeave={handleSidebarLeave}>
        <Link to="/profile" className="flex w-full p-3  transition-colors">
          <div className="flex w-full items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-15 h-15  rounded-full overflow-hidden border-2 border-gray-100">
                <img
                  src="./images/profile.jpg"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col mt-1.5 justify-center flex-1">
              <p className="text-lg font-semibold text-gray-800">
                Your Profile
              </p>
              <p className="text-xs text-gray-500 mt-1">3 dogs listed</p>
            </div>
          </div>
        </Link>

        <div className="p-6 flex flex-col">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Filters</h2>
          <div className="space-y-6 flex-1 overflow-y-auto">
            <div>
              {/* <h3 className="font-semibold mb-3 text-gray-700">Dog Color</h3> */}

              {/* Color Filter Dropdown */}
              <div className="relative">
                <button
                  className="w-full px-4 py-2 rounded-lg border border-gray-300  text-center mb-2"
                  onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}>
                  {selectedColor || "Choose Dog Type"}
                </button>

                {isColorDropdownOpen && (
                  <div className="  w-full  bg-[#F7F6F1] rounded-lg p-2">
                    <div className="flex overflow-x-scroll gap-2 pb-2">
                      {dogType.map((typeItem) => (
                        <div key={typeItem.name} className="flex-shrink-0 w-40">
                          <img
                            src={typeItem.imageUrl}
                            alt={typeItem.name}
                            title={typeItem.name}
                            className={`w-40 h-40 object-cover rounded-lg cursor-pointer border-2 ${
                              selectedColor === typeItem.name
                                ? "border-blue-400"
                                : "border-transparent"
                            } hover:border-blue-400`}
                            onClick={() => handleColorSelect(typeItem)}
                          />
                          <span className="block text-center mt-1 text-sm font-medium text-gray-700">
                            {typeItem.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="custom-select">
              {/* <h3 className="font-semibold mb-3 text-gray-700">Distance</h3> */}
              <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2  ">
                <option>Within 1km</option>
                <option>Within 5km</option>
                <option>Within 10km</option>
                <option>No Limit</option>
              </select>
            </div>
          </div>
        </div>

        <div
          onClick={() => {
            console.log("User logged out");
            setNotificationMessage("Successfully logged out");
            setnotificationImage("./images/profile.jpg");
          }}
          className=" fixed bottom-0 mb-4 w-full p-2 flex items-center justify-center  cursor-pointer   ">
          <img
            src="./images/logout.svg"
            className="w-[18px] h-[18px] mr-2 invert-50 "
            alt=""
          />
          <button className="  text-red-500 font-semibold  cursor-pointer">
            Log Out
          </button>
        </div>
      </div>
      {/* Sidebar and overlay components remain the same */}

      {/* Map Container */}
      {location ? (
        <MapContainer
          center={location}
          zoom={16}
          className="w-full h-full"
          whenCreated={(map) => {
            setInitialZoom(map.getZoom());
          }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {initialPosition && (
            <ResetViewControl
              initialPosition={initialPosition}
              initialZoom={initialZoom}
            />
          )}

          <Marker position={location}>
            <Popup>You are here</Popup>
          </Marker>

          {loadingDogs && (
            <div className="leaflet-top leaflet-left">
              <div className="leaflet-control bg-white p-2 rounded shadow-md">
                Loading dog locations...
              </div>
            </div>
          )}

          {error && (
            <div className="leaflet-top leaflet-left">
              <div className="leaflet-control bg-red-100 p-2 rounded shadow-md text-red-600">
                {error}
              </div>
            </div>
          )}
          {dogLocations.map((dog) => (
            <Marker key={dog._id} position={[dog.lat, dog.lon]} icon={dogIcon}>
              <Popup>
                <div className="w-56 max-w-[230px]">
                  {/* Dog Image */}
                  <img
                    className="rounded-xl w-full h-full object-cover"
                    src={dog.imageUrl}
                    alt={`${dog.type} dog`}
                  />

                  {/* Info Row */}
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <div className="text-1xl text-gray-600">
                      Dog listed nearby
                    </div>

                    <div className="flex flex-nowrap">
                      {/* Directions Button */}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${dog.lat},${dog.lon}&travelmode=driving`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex justify-center mr-2 items-center">
                        <button className=" cursor-pointer  ">
                          <img
                            className="w-6 h-6"
                            src="/images/location.svg"
                            alt="Directions"
                          />
                        </button>
                      </a>

                      {/* Info Toggle Button */}
                      <button
                        onClick={() => setIsContactAsked(!isContactAsked)}
                        className=" cursor-pointer ">
                        <img
                          className="w-6 h-6"
                          src="./images/information.svg"
                          alt="More info"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {isContactAsked && (
                    <div className="mt-3 p-3 bg-gray-100 rounded-xl text-xs space-y-2">
                      {dog.type && (
                        <div>
                          <span className="font-medium">Type:</span> {dog.type}
                        </div>
                      )}
                      {dog.age && (
                        <div>
                          <span className="font-medium">Age:</span> {dog.age}
                        </div>
                      )}
                      {(dog.email || dog.phone) && (
                        <div className="pt-2 mt-2 border-t border-gray-300 space-y-2">
                          {dog.email && (
                            <div className="flex justify-between items-center gap-2">
                              <span className="truncate max-w-[140px] text-xs overflow-hidden">
                                {dog.email}
                              </span>
                              <button
                                onClick={() => handleClipboard(dog.email)}
                                className="text-blue-500 hover:text-blue-700">
                                <img
                                  className="w-3.5 h-3.5 cursor-pointer"
                                  src="./images/copy.svg"
                                  alt="Copy"
                                />
                              </button>
                            </div>
                          )}
                          {dog.phone && (
                            <div className="flex justify-between items-center gap-2">
                              <span className="truncate max-w-[140px] text-xs overflow-hidden">
                                {dog.phone}
                              </span>
                              <button
                                onClick={() => handleClipboard(dog.phone)}
                                className="text-blue-500 hover:text-blue-700">
                                <img
                                  className="w-3.5 h-3.5 cursor-pointer"
                                  src="./images/copy.svg"
                                  alt="Copy"
                                />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-xl text-gray-600">Fetching location...</p>
        </div>
      )}
    </div>
  );
};

export default MapView;
