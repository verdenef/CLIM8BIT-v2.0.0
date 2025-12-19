"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group pixel-toast"
      toastOptions={{
        classNames: {
          toast: "pixel-toast-item",
          title: "pixel-toast-title",
          description: "pixel-toast-description",
          success: "pixel-toast-success",
          error: "pixel-toast-error",
          warning: "pixel-toast-warning",
          info: "pixel-toast-info",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
