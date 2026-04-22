import React, { useContext, useRef } from "react";
import { Search, MapPin } from "lucide-react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SlideUp } from "../utils/Animation";
// Import Swiper components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Hero = () => {
  const navigate = useNavigate();

  const titleRef = useRef(null);
  const locationRef = useRef(null);

  const { setSearchFilter, setIsSearched } = useContext(AppContext);

  // Campus-themed slider images - using Pexels images instead of Unsplash
  const sliderImages = [
    "https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg",
    "https://images.pexels.com/photos/159490/yale-university-landscape-universities-schools-159490.jpeg",
    "https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg",
    "https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg",
    "https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg",
  ];

  const searchHandler = (e) => {
    e.preventDefault();

    setSearchFilter({
      title: titleRef.current.value,
      location: locationRef.current.value,
    });

    setIsSearched(true);

    if (titleRef.current.value || locationRef.current.value) {
      navigate("/all-jobs/all");
    }
  };

  return (
    <section className="relative overflow-hidden rounded-lg">
      {/* Image Slider */}
      <div className="absolute inset-0 z-0">
        <Swiper
          modules={[Autoplay, EffectFade, Navigation, Pagination]}
          effect="fade"
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          className="h-full w-full"
        >
          {sliderImages.map((image, index) => (
            <SwiperSlide key={index}>
              <div 
                className="h-full w-full bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${image})`,
                  filter: 'brightness(0.4)'
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      {/* Content */}
      <div className="relative z-10 py-20 px-6 md:px-20">
        <div className="text-center max-w-2xl mx-auto">
          {/* Heading */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight sm:leading-snug"
            variants={SlideUp(0.4)}
            initial="hidden"
            animate="visible"
          >
            CampusConnect: <span className="text-blue-400">University Talent Finder</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            className="text-gray-200 mb-10 text-lg"
            variants={SlideUp(0.4)}
            initial="hidden"
            animate="visible"
          >
            Discover opportunities, connect with talent, and collaborate on projects
            within your university community.
          </motion.p>

          {/* Search Form */}
          <motion.form
            onSubmit={searchHandler}
            className="bg-white/90 backdrop-blur-sm rounded-lg shadow p-4 flex flex-col sm:flex-row gap-4 sm:gap-2 items-stretch sm:items-center w-full"
            variants={SlideUp(0.5)}
            initial="hidden"
            animate="visible"
          >
            {/* Job Title Input */}
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 md:py-2.5 bg-white w-full">
              <Search className="text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                name="job"
                placeholder="Search opportunities"
                aria-label="Title"
                autoComplete="on"
                className="w-full outline-none text-sm bg-transparent placeholder-gray-500"
                ref={titleRef}
              />
            </div>

            {/* Location Input */}
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 md:py-2.5 bg-white w-full">
              <MapPin className="text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                name="location"
                placeholder="Department or location"
                aria-label="Location"
                autoComplete="on"
                className="w-full outline-none text-sm bg-transparent placeholder-gray-500"
                ref={locationRef}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 md:py-3 px-6 rounded-md transition text-sm cursor-pointer"
            >
              Search
            </button>
          </motion.form>
        </div>
    </div>
      </section>
    );
};

export default Hero;
