"use client";

import React from "react";

export const MadeWithDyad = () => {
  return (
    <div className="mt-12 text-center text-sm text-muted-foreground">
      Made with ❤️ by{" "}
      <a
        href="https://www.dyad.sh"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-primary"
      >
        Dyad
      </a>
    </div>
  );
};