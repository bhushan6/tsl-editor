import React from "react";

interface WindowWrapperProps {
}

const WindowWrapper = React.forwardRef<HTMLDivElement, WindowWrapperProps>(
  (props, ref) => {
    return (
      <div
        ref={ref}
        style={{
          color: "var(--text-neutral-color)",
          backgroundColor: "var(--node-background)",
          borderBottom: "2px solid var(--border-color)",
          padding: "14px 12px 12px",
        }}
      />
    );
  }
);

WindowWrapper.displayName = "WindowWrapper";

export default WindowWrapper;