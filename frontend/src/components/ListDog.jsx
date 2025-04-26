import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ListDog = () => {
  // Form state
  const [step, setStep] = useState(1);
  const [dogImage, setDogImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [type, settype] = useState("");
  const [location, setLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [manualError, setManualError] = useState("");

  // Update Step 3 section with:
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [istypeDropdownOpen, setIstypeDropdownOpen] = useState(false);
  const [isAgeDropdownOpen, setIsAgeDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({});

  // Dog type data with your specified images

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

  const ageRanges = [
    "0-6 months",
    "6-12 months",
    "1-2 years",
    "3-5 years",
    "More than 5 years",
  ];

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validate phone number format
  const validatePhone = (phone) => {
    const re = /^[0-9]{10,15}$/;
    return re.test(phone);
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDogImage(file);
      setStep(2);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Handle location capture
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setStep(4);
          setIsLoadingLocation(false);
        },
        (error) => {
          alert("Error getting location: " + error.message);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const validateContactInfo = () => {
    const newErrors = {};

    if (!email && !phone) {
      newErrors.contact = "Please provide at least email or phone number";
    }

    if (email && !validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (phone && !validatePhone(phone)) {
      newErrors.phone = "Please enter a valid phone number (10-15 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateContactInfo()) return;

    try {
      // Upload image to Supabase
      const formData = new FormData();
      formData.append("file", dogImage);

      const uploadResponse = await axios.post(
        "https://dog-adoption-platform-backend.onrender.com/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Create final dog data
      const dogData = {
        imageUrl: uploadResponse.data.downloadUrl,
        type,
        location: {
          lat: location.lat,
          lng: location.lng,
        },
        age,
        email,
        phone,
      };

      // Send to MongoDB
      const response = await axios.post(
        "http://localhost:5000/api/dogs",
        dogData
      );

      alert("Dog listing submitted successfully!");
      resetForm();
    } catch (error) {
      console.error("Submission error:", error);
      alert(
        `Submission failed: ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Add reset form function
  const resetForm = () => {
    setStep(1);
    setDogImage(null);
    setPreviewImage(null);
    settype("");
    setLocation(null);
    setAge("");
    setEmail("");
    setPhone("");
    setErrors({});
  };
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="inline-flex items-center mb-6 text-blue-500 hover:text-blue-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor">
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          List a Found Dog
        </h1>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5, 6].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex flex-col items-center ${
                  step >= stepNumber ? "text-blue-500" : "text-gray-400"
                }`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= stepNumber
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}>
                  {stepNumber}
                </div>
                <span className="text-xs mt-1">
                  {stepNumber === 1 && "Photo"}
                  {stepNumber === 2 && "Type"}
                  {stepNumber === 3 && "Location"}
                  {stepNumber === 4 && "Age"}
                  {stepNumber === 5 && "Contact"}
                  {stepNumber === 6 && "Submit"}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-1 mt-4">
            <div
              className="bg-blue-500 h-1 transition-all duration-300"
              style={{ width: `${((step - 1) / 5) * 100}%` }}></div>
          </div>
        </div>

        {/* Step 1: Upload photo */}
        {step === 1 && (
          <div className="text-center">
            <label className="cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Dog preview"
                    className="mx-auto h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div>
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload a photo of the dog
                    </p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                required
              />
            </label>
            {previewImage && (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Next
              </button>
            )}
          </div>
        )}

        {/* Step 2: Select dog type */}
        {step === 2 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dog Type
            </label>
            <div className="relative">
              <button
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-center mb-2"
                onClick={() => setIstypeDropdownOpen(!istypeDropdownOpen)}>
                {type || "Choose Dog Type"}
              </button>

              {istypeDropdownOpen && (
                <div className="w-full bg-[#F7F6F1] rounded-lg p-2">
                  <div className="flex overflow-x-scroll gap-2 pb-2">
                    {dogType.map((typeItem) => (
                      <div key={typeItem.name} className="flex-shrink-0 w-40">
                        <img
                          src={typeItem.imageUrl}
                          alt={typeItem.name}
                          title={typeItem.name}
                          className={`w-40 h-40 object-cover rounded-lg cursor-pointer border-2 ${
                            type === typeItem.name
                              ? "border-blue-400"
                              : "border-transparent"
                          } hover:border-blue-400`}
                          onClick={() => {
                            settype(typeItem.name);
                            setIstypeDropdownOpen(false);
                            setStep(3);
                          }}
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
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Where does the dog usually stay ?
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsLoadingLocation(true);
                  getLocation();
                }}
                disabled={isLoadingLocation}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoadingLocation ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Finding Location...
                  </div>
                ) : (
                  "Use Current Location"
                )}
              </button>

              <p className="mt-2 text-xs text-gray-500">
                We'll use your device's location services to get coordinates
              </p>

              <button
                type="button"
                onClick={() => setShowManualInput(!showManualInput)}
                className="mt-6 text-[12px] text-blue-500 hover:text-blue-700">
                {showManualInput
                  ? "Hide manual input"
                  : "Enter co-ordinates manually"}
              </button>

              {showManualInput && (
                <div className="mt-4 space-y-3">
                  <div>
                    <input
                      type="number"
                      step="any"
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      placeholder="Latitude"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="any"
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                      placeholder="Longitude"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {manualError && (
                    <div className="text-red-500 text-sm">{manualError}</div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (!manualLat || !manualLng) {
                        setManualError(
                          "Please enter both latitude and longitude"
                        );
                        return;
                      }
                      if (isNaN(manualLat)) {
                        setManualError("Latitude must be a number");
                        return;
                      }
                      if (isNaN(manualLng)) {
                        setManualError("Longitude must be a number");
                        return;
                      }
                      setManualError("");
                      setLocation({
                        lat: parseFloat(manualLat),
                        lng: parseFloat(manualLng),
                      });
                      setShowManualInput(false);
                      setStep(4);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                    Set Manual Location
                  </button>
                </div>
              )}

              {location && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm">
                    Location captured: {location.lat.toFixed(4)},{" "}
                    {location.lng.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Select age */}
        {step === 4 && (
          <div
            className="mb-6"
            style={{
              height: isAgeDropdownOpen ? "200px" : "auto",
              transition: "height 0.3s ease",
            }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Age
            </label>
            <div className="relative">
              <button
                type="button"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-left"
                onClick={() => setIsAgeDropdownOpen(!isAgeDropdownOpen)}>
                {age || "Select age range"}
              </button>
              {isAgeDropdownOpen && (
                <div className="absolute z-[1000] w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto transform translate-y-2 ">
                  {ageRanges.map((ageRange) => (
                    <div
                      key={ageRange}
                      className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                        age === ageRange ? "bg-blue-50" : ""
                      }`}
                      onClick={() => {
                        setAge(ageRange);
                        setIsAgeDropdownOpen(false);
                        setStep(5);
                      }}>
                      {ageRange}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Contact information */}
        {step === 5 && (
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Contact Information
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Please provide at least one way to contact you
            </p>

            {errors.contact && (
              <div className="text-red-500 text-sm mb-4">{errors.contact}</div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="your@email.com"
              />
              {errors.email && (
                <div className="text-red-500 text-sm mt-1">{errors.email}</div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="1234567890"
              />
              {errors.phone && (
                <div className="text-red-500 text-sm mt-1">{errors.phone}</div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (validateContactInfo()) {
                  setStep(6);
                }
              }}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Next
            </button>
          </div>
        )}

        {/* Step 6: Review and submit */}
        {step === 6 && (
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Review Your Listing
            </h2>
            <div className="mb-4">
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Dog to list"
                  className="h-40 mx-auto object-cover rounded-lg"
                />
              )}
            </div>
            <div className="space-y-3 mb-6">
              <p>
                <span className="font-medium">Type:</span> {type}
              </p>
              <p>
                <span className="font-medium">Location:</span>{" "}
                {location &&
                  `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
              </p>
              <p>
                <span className="font-medium">Age:</span> {age}
              </p>
              {email && (
                <p>
                  <span className="font-medium">Email:</span> {email}
                </p>
              )}
              {phone && (
                <p>
                  <span className="font-medium">Phone:</span> {phone}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              Submit Listing
            </button>
          </div>
        )}

        {/* Navigation buttons */}
        {step > 1 && step <= 6 && (
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800">
              {step !== 6 ? "Back" : "Edit"}
            </button>
            {step < 5 && ( // Skip next button for location and contact steps
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && previewImage) setStep(2);
                  else if (step === 2 && type) setStep(3);
                  else if (step === 3 && type) setStep(4);
                  else if (step === 4 && age) setStep(5);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                disabled={(step === 2 && !type) || (step === 4 && !age)}>
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListDog;
