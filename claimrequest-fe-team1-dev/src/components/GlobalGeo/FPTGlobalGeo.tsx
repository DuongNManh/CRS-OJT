// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { useTheme } from "@/hooks/use-theme";
import Globe from "globe.gl";
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";

const FPTGlobalGeo = () => {
  const globeEl = useRef(null);
  const [geoData, setGeoData] = useState([]);
  const [arcsData, setArcsData] = useState([]);
  const [isSpinning, setIsSpinning] = useState(true);
  const rotationSpeed = 0.15;
  const { theme } = useTheme();

  useEffect(() => {
    // Fetch GeoJSON data
    fetch("/Geo.json")
      .then((res) => res.json())
      .then((data) => {
        // Add size and color properties to each point
        const enhancedData = data.map((point) => ({
          ...point,
          size: 0.02, // Height of the point from the surface
          radius: 0.5, // Size of the point
          color: "#FF5733", // Point color
          ringColor: "#FFC300", // Ring color
          elevation: 0.02, // Elevation from surface for ring effect
        }));
        setGeoData(enhancedData);
        const arcs = generateArcsData(enhancedData);
        setArcsData(arcs);
      })
      .catch((err) => toast.error("Failed to fetch GeoJSON data"));
  }, []);

  const getRandomColor = () => {
    const colors = [
      "rgba(255, 165, 0, 0.5)", // orange
      "rgba(255, 0, 0, 0.5)", // red
      "rgba(0, 255, 255, 0.5)", // cyan
      "rgba(0, 255, 0, 0.5)", // green
      "rgba(255, 255, 0, 0.5)", // yellow
      "rgba(0, 0, 255, 0.5)", // blue
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const dayTexture = "//unpkg.com/three-globe/example/img/earth-day.jpg";
  const nightTexture =
    "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg";

  const generateArcsData = (points) => {
    const arcs = [];
    // Connect random points
    points.forEach((startPoint) => {
      // Generate 1-3 random connections for each point
      const numConnections = Math.floor(Math.random() * 2) + 1;

      for (let i = 0; i < numConnections; i++) {
        const endPoint = points[Math.floor(Math.random() * points.length)];

        // Avoid self-connections
        if (startPoint !== endPoint) {
          arcs.push({
            startLat: startPoint.lat,
            startLng: startPoint.lng,
            endLat: endPoint.lat,
            endLng: endPoint.lng,
            color: getRandomColor(),
            // Random arc properties
            altitude: Math.random() * 0.5 + 0.1, // Random height between 0.1 and 0.6
            stroke: Math.random() * 1 + 0.5, // Random thickness between 0.5 and 1.5
            dashLength: Math.random() * 0.8 + 0.2, // Random dash length between 0.2 and 1
            dashGap: Math.random() * 4 + 1, // Random gap between 1 and 5
            dashAnimateTime: Math.random() * 3000 + 1000, // Random animation time between 1000ms and 4000ms
          });
        }
      }
    });
    return arcs;
  };

  useEffect(() => {
    if (!globeEl.current) return;

    const backgroundImage = theme === "dark" ? nightTexture : dayTexture;
    const globe = Globe()(globeEl.current);

    globe.globeImageUrl(backgroundImage);
    globe
      .showAtmosphere(true)
      .width(600)
      .height(600)
      .globeImageUrl(backgroundImage)
      .showGraticules(true)
      .showAtmosphere(true)
      .atmosphereAltitude(0.15)
      .atmosphereColor("#000000")
      .showGlobe(true)
      // Updated Points configuration
      .pointsData(geoData)
      .pointAltitude("size")
      .pointRadius("radius")
      .pointColor("color")
      .pointsMerge(false) // Set to false to allow individual point styling
      .pointResolution(32) // Increased resolution for smoother circles
      .pointLabel(
        ({ name, lat, lng }) => `
        <div style="color: white; background-color: rgba(0, 0, 0, 0.75); padding: 5px; border-radius: 5px;">
          <div style="font-weight: bold;">${name}</div>
          <div>Lat: ${lat.toFixed(2)}°</div>
          <div>Lng: ${lng.toFixed(2)}°</div>
        </div>
      `,
      )

      // Ring effect for points
      .customLayerData(geoData)
      .customThreeObject((d) => {
        const geometry = new THREE.RingGeometry(
          d.radius * 1.2,
          d.radius * 1.4,
          32,
        );
        const material = new THREE.MeshBasicMaterial({
          color: d.ringColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
        });
        return new THREE.Mesh(geometry, material);
      })
      .customThreeObjectUpdate((obj, d) => {
        Object.assign(obj.position, globe.getCoords(d.lat, d.lng, d.elevation));
        obj.lookAt(0, 0, 0);
      })

      // Arcs configuration
      .arcsData(arcsData)
      .arcColor((d) => d.color)
      .arcAltitude((d) => d.altitude)
      .arcStroke((d) => d.stroke)
      .arcDashLength((d) => d.dashLength)
      .arcDashGap((d) => d.dashGap)
      .arcDashAnimateTime((d) => d.dashAnimateTime)
      .arcsTransitionDuration(1000);

    if (geoData) {
      globe.pointsData(geoData);
    }

    globe.backgroundColor("rgba(0, 0, 0, 0)"); // Set transparent background

    // Enable auto-rotation using built-in controls
    const controls = globe.controls();
    controls.autoRotate = isSpinning;
    controls.autoRotateSpeed = rotationSpeed;

    // Set minDistance to prevent zooming out
    controls.minDistance = 100; // Set this to the desired minimum zoom level
    controls.maxDistance = 400; // Optional: Set a maximum zoom level if needed
    // defautl distance
    controls.distanceRadiusScale = 1.5;

    // Add ambient light to make points more visible
    const ambientLight = new THREE.AmbientLight(0xbbbbbb);
    globe.scene().add(ambientLight);
  }, [geoData, arcsData, isSpinning, rotationSpeed, theme]);

  return (
    <div
      style={{
        width: "600px", // Fixed width
        height: "600px", // Fixed height
        borderRadius: "50%", // Make it circular
        overflow: "hidden", // Hide overflow to maintain circular shape
        position: "relative",
        backgroundColor: "rgba(0, 0, 0, 0)", // Set transparent background
        margin: "0 auto", // Center the globe
      }}
      ref={globeEl}
    />
  );
};

export default FPTGlobalGeo;
