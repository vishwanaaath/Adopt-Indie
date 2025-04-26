import React from "react";
import { Link } from "react-router-dom";
import "./AdoptionStats.css";

const AdoptionStats = () => {
  let dogsAdopted = 250;
  let dogsListed = 800;

  return (
    <div className="hero-section custom flex flex-col items-start sm:justify-center justify-start  min-h-screen text-white p-6">
      <div className="w-full max-w-4xl  text-center">
        <h1
          className="text-4xl md:text-5xl font-bold md:font-semibold 
              text-center md:text-left 
              px-4 md:px-0 
              leading-tight md:leading-normal
              mb-6 mt-15 md:mb-8
              max-w-2xl md:max-w-4xl mx-auto md:mx-0">
          Helping you adopt indies around you
        </h1>
        <div className="hidden md:flex justify-center space-x-16 mb-12">
          <div>
            <p className="text-4xl font-bold">{dogsAdopted}</p>
            <p className="text-3xl">dogs adopted</p>
          </div>
          <div>
            <p className="text-4xl font-bold">{dogsListed}</p>
            <p className="text-3xl">dogs listed</p>
          </div>
        </div>

        <div className="flex flex-col space-y-6 w-full max-w-md mx-auto">
          <Link
            to="/map"
            className="border custom-button border-white text-2xl py-4 px-8 rounded-lg transition-colors duration-200">
            Find Dogs to Adopt
          </Link>
          <Link
            to="/list-dog"
            className="border custom-button border-white text-2xl py-4 px-8 rounded-lg transition-colors duration-200">
            List a Dog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdoptionStats;
