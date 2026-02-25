// components/SplineViewer/index.jsx
"use client";

import Spline from "@splinetool/react-spline";

export default function SplineViewer() {
  return (
    <Spline
      scene="https://prod.spline.design/WSRvLniBZI0qPx1C/scene.splinecode"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
