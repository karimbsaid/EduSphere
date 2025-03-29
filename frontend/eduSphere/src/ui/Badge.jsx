/* eslint-disable react/prop-types */
import React from "react";

export default function Badge({ style, text }) {
  return (
    <span className={`rounded-xl px-2 py-1 font-semibold ${style}`}>
      {text}
    </span>
  );
}
