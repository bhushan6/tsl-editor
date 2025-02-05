import * as TSL from "three/tsl";
import { Output, schema, Node } from "../nodl-core";
import { z } from "zod";
import { of } from "rxjs";
import { createVarNameForNode } from "./utils";

const {
  positionGeometry,
  positionLocal,
  positionWorld,
  positionWorldDirection,
  positionView,
  positionViewDirection,
  normalGeometry,
  normalLocal,
  normalView,
  normalWorld,
  transformedNormalView,
  transformedNormalWorld,
  transformedClearcoatNormalView,
  tangentGeometry,
  tangentLocal,
  tangentView,
  tangentWorld,
  transformedTangentView,
  transformedTangentWorld,
  bitangentGeometry,
  bitangentLocal,
  bitangentView,
  bitangentWorld,
  transformedBitangentView,
  transformedBitangentWorld,
  cameraNear,
  cameraFar,
  cameraProjectionMatrix,
  cameraProjectionMatrixInverse,
  cameraViewMatrix,
  cameraWorldMatrix,
  cameraNormalMatrix,
  cameraPosition,
  modelDirection,
  modelViewMatrix,
  modelNormalMatrix,
  modelWorldMatrix,
  modelPosition,
  modelScale,
  modelViewPosition,
  modelWorldMatrixInverse,
  screenUV,
  screenCoordinate,
  screenSize,
  viewportUV,
  viewport,
  viewportCoordinate,
  viewportSize,
} = TSL;

const TSLNodes = {
  positionGeometry,
  positionLocal,
  positionWorld,
  positionWorldDirection,
  positionView,
  positionViewDirection,
  normalGeometry,
  normalLocal,
  normalView,
  normalWorld,
  transformedNormalView,
  transformedNormalWorld,
  transformedClearcoatNormalView,
  tangentGeometry,
  tangentLocal,
  tangentView,
  tangentWorld,
  transformedTangentView,
  transformedTangentWorld,
  bitangentGeometry,
  bitangentLocal,
  bitangentView,
  bitangentWorld,
  transformedBitangentView,
  transformedBitangentWorld,
  cameraNear,
  cameraFar,
  cameraProjectionMatrix,
  cameraProjectionMatrixInverse,
  cameraViewMatrix,
  cameraWorldMatrix,
  cameraNormalMatrix,
  cameraPosition,
  modelDirection,
  modelViewMatrix,
  modelNormalMatrix,
  modelWorldMatrix,
  modelPosition,
  modelScale,
  modelViewPosition,
  modelWorldMatrixInverse,
  screenUV,
  screenCoordinate,
  screenSize,
  viewportUV,
  viewport,
  viewportCoordinate,
  viewportSize,
};

const nodeFactory = (name: keyof typeof TSLNodes) => {
  const node = TSLNodes[name];
  if (!node) throw new Error(`Node ${name} not found`);
  return class extends Node {
    name = name;
    inputs = {};
    outputs = {
      value: new Output({
        name: "Value",
        type: schema(z.any()),
        observable: of(() => node),
      }),
    };
    public code = () => {
      const varName = createVarNameForNode(this);
      return {
        code: `
        const ${varName} = ${name}`,
        dependencies: [name],
      };
    };
  };
};

export const generateNode = () => {
  const GeneratedNodes: { [key: string]: any } = {};
  for (const key in TSLNodes) {
    const nodeName = key as keyof typeof TSLNodes;
    GeneratedNodes[key] = nodeFactory(nodeName);
  }
  return GeneratedNodes;
};
const GeneratedNodes = generateNode();

export const PositionNodes = GeneratedNodes;
