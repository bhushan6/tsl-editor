import { css } from "@emotion/react";

import { Bounds } from "../../utils/bounds/bounds.types";

export const circuitSelectionStyles = ({ x, y, width, height }: Bounds) => css`
  position: absolute;
  top: 0;
  left: 0;
  width: ${width}px;
  height: ${height}px;
  transform: translate(${x}px, ${y}px);
  border: 1px solid var(--accent-color);
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 29;
`;

export const circuitContainerStyles = css`
  position: absolute;
  font-family: "Inter", Arial, Helvetica, sans-serif;
  font-size: 12px;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  @supports (font-variation-settings: normal) {
    :root {
      font-family: "Inter var", sans-serif;
    }
  }
`;
