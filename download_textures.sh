#!/bin/bash

# Create textures directory if it doesn't exist
mkdir -p public/textures

# Download planet textures
cd public/textures

# Sun
curl -L -o sun.jpg "https://www.solarsystemscope.com/textures/download/2k_sun.jpg"

# Mercury
curl -L -o mercury.jpg "https://www.solarsystemscope.com/textures/download/2k_mercury.jpg"

# Venus
curl -L -o venus.jpg "https://www.solarsystemscope.com/textures/download/2k_venus_atmosphere.jpg"

# Earth
curl -L -o earth.jpg "https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg"

# Mars
curl -L -o mars.jpg "https://www.solarsystemscope.com/textures/download/2k_mars.jpg"

# Jupiter
curl -L -o jupiter.jpg "https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg"

# Saturn
curl -L -o saturn.jpg "https://www.solarsystemscope.com/textures/download/2k_saturn.jpg"
curl -L -o saturn_ring.png "https://www.solarsystemscope.com/textures/download/2k_saturn_ring_alpha.png"

# Uranus
curl -L -o uranus.jpg "https://www.solarsystemscope.com/textures/download/2k_uranus.jpg"

# Neptune
curl -L -o neptune.jpg "https://www.solarsystemscope.com/textures/download/2k_neptune.jpg"

echo "All textures downloaded successfully!" 