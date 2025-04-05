// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { useTheme } from "@/hooks/use-theme";
import Globe from "globe.gl";
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";

interface GeoPoint {
  lat: number;
  lng: number;
  name: string;
  size?: number;
  radius?: number;
  color?: string;
  ringColor?: string;
  elevation?: number;
}

interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  altitude: number;
  stroke: number;
  dashLength: number;
  dashGap: number;
  dashAnimateTime: number;
}

const FPTGlobalGeo: React.FC = React.memo(() => {
  const globeEl = useRef<HTMLDivElement | null>(null);
  const [geoData, setGeoData] = useState<GeoPoint[]>([]);
  const [arcsData, setArcsData] = useState<ArcData[]>([]);
  const rotationSpeed = 0.2;
  const { theme } = useTheme();

  useEffect(() => {
    console.log("Fetching GeoJSON data...");
    // Fetch GeoJSON data
    fetch("/Geo.json")
      .then((res) => res.json())
      .then((data: GeoPoint[]) => {
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
      .catch((err) => console.error("Failed to fetch GeoJSON data", err));
  }, []);

  const getRandomColor = (): string => {
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

  const dayTexture = "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg";
  const nightTexture = "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg";

  const generateArcsData = (points: GeoPoint[]): ArcData[] => {
    const arcs: ArcData[] = [];
    points.forEach((startPoint) => {
      const numConnections = Math.floor(Math.random() * 2) + 1;

      for (let i = 0; i < numConnections; i++) {
        const endPoint = points[Math.floor(Math.random() * points.length)];
        if (startPoint !== endPoint) {
          arcs.push({
            startLat: startPoint.lat,
            startLng: startPoint.lng,
            endLat: endPoint.lat,
            endLng: endPoint.lng,
            color: getRandomColor(),
            altitude: Math.random() * 0.5 + 0.1,
            stroke: Math.random() * 1 + 0.5,
            dashLength: Math.random() * 0.8 + 0.2,
            dashGap: Math.random() * 4 + 1,
            dashAnimateTime: Math.random() * 3000 + 1000,
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

    globe
      .globeImageUrl(backgroundImage)
      .showAtmosphere(true)
      .width(600)
      .height(600)
      .showGraticules(true)
      .atmosphereAltitude(0.15)
      .atmosphereColor("#000000")
      .pointsData(geoData)
      .pointAltitude("size")
      .pointRadius("radius")
      .pointColor("color")
      .pointsMerge(false)
      .pointResolution(32)
      .pointLabel(
        ({ name, lat, lng }) => `
        <div style="color: white; background-color: rgba(0, 0, 0, 0.75); padding: 5px; border-radius: 5px;">
          <div style="font-weight: bold;">${name}</div>
          <div>Lat: ${lat.toFixed(2)}°</div>
          <div>Lng: ${lng.toFixed(2)}°</div>
        </div>
      `
      )
      .customLayerData(geoData)
      .customThreeObject((d) => {
        const geometry = new THREE.RingGeometry(d.radius! * 1.2, d.radius! * 1.4, 32);
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
      .arcsData(arcsData)
      .arcColor((d) => d.color)
      .arcAltitude((d) => d.altitude)
      .arcStroke((d) => d.stroke)
      .arcDashLength((d) => d.dashLength)
      .arcDashGap((d) => d.dashGap)
      .arcDashAnimateTime((d) => d.dashAnimateTime)
      .arcsTransitionDuration(1000);

    globe.backgroundColor("rgba(0, 0, 0, 0)");

    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = rotationSpeed;
    controls.minDistance = 100;
    controls.maxDistance = 400;
    controls.distanceRadiusScale = 1.5;

    const ambientLight = new THREE.AmbientLight(0xbbbbbb);
    globe.scene().add(ambientLight);
  }, [geoData, arcsData, rotationSpeed, theme]);

  return (
    <div
      style={{
        width: "600px",
        height: "600px",
        borderRadius: "50%",
        overflow: "hidden",
        position: "relative",
        backgroundColor: "rgba(0, 0, 0, 0)",
        margin: "0 auto",
      }}
      ref={globeEl}
    />
  );
});

export default FPTGlobalGeo;