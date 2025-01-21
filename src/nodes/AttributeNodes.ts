import { Output, schema, Node } from "../nodl-core";
import { z } from "zod";

import { uv, vertexColor } from "three/tsl";
import { of } from "rxjs";
import { createVarNameForNode } from "./utils";

const UVSchema = schema(z.any());

export class UV extends Node {
  name = "UV";
  inputs = {};
  outputs = {
    value: new Output({
      name: "Value",
      type: UVSchema,
      observable: of(uv),
    }),
  };
  public code = () => {
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = uv()`,
      dependencies: ["uv"],
    };
  };
}

export class VertexColor extends Node {
  name = "Vertex Color";
  inputs = {};
  outputs = {
    value: new Output({
      name: "Value",
      type: UVSchema,
      observable: of(vertexColor),
    }),
  };
  public code = () => {
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = vertexColor()`,
      dependencies: ["vertexColor"],
    };
  };
}

export const AttributeNodes = {
  UV,
  VertexColor,
};
