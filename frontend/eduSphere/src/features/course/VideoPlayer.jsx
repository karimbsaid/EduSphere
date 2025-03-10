/* eslint-disable react/prop-types */
import React from "react";
import ReactPlayer from "react-player";

export default function VideoPlayer({ url, onEnded }) {
  return (
    <div className="flex justify-center items-center p-4">
      <ReactPlayer
        url={url}
        onEnded={onEnded}
        controls
        width="100%"
        height="500px"
      />
    </div>
  );
}
