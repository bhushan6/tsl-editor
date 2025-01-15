import {
  uv,
  vec4,
  float,
  int,
  uint,
  bool,
  color,
  Fn,
  add,
  mul,
  sub,
  div,
  mod,
  modInt,
  equal,
  lessThan,
  greaterThan,
  lessThanEqual,
  greaterThanEqual,
  abs,
  vec2,
  acos,
  asin,
  atan,
  atan2,
  clamp,
  ceil,
  cos,
  cross,
  degrees,
  distance,
  dot,
  floor,
  fract,
  length,
  log,
  vec3,
  uniform,
  time,
  texture,
} from "three/tsl";
import { Node } from "../nodl-core";

export const createVarNameForNode = (node: Node) => {
  if (node.localName && node.localName.length > 0) {
    return node.localName;
  }
  const nodeId = node.id;
  const lastFourChars = nodeId.slice(-4).replace("-", "");
  return `node_${lastFourChars}`;
};

const THREE_TSL = {
  uv,
  vec4,
  float,
  int,
  uint,
  bool,
  color,
  Fn,
  add,
  mul,
  sub,
  div,
  mod,
  modInt,
  equal,
  lessThan,
  greaterThan,
  lessThanEqual,
  greaterThanEqual,
  abs,
  vec2,
  acos,
  asin,
  atan,
  atan2,
  clamp,
  ceil,
  cos,
  cross,
  degrees,
  distance,
  dot,
  floor,
  fract,
  length,
  log,
  vec3,
  uniform,
  time,
  texture,
};

export const THREE_TSL_CONTEXT = Object.keys(THREE_TSL);

export const evaluateGeneratedTSLCode = (code: string) => {
  return function () {
    return eval(code);
  }.call(THREE_TSL_CONTEXT);
};
