import { Output, schema, Node } from "../nodl-core";
import { z } from "zod";

import { uv, vertexColor } from "three/tsl";
import { of } from "rxjs";
import { createVarNameForNode } from "./utils";

const UVSchema = schema(z.any());
//type = "AttributeNode"
//_attributeName = "uv"
export class UV extends Node {
  name = "UV";
  inputs = {};
  outputs = {
    value: new Output({
      name: "Value",
      type: UVSchema,
      observable: of(uv)
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

console.log(uv(1).toJSON(), "uv", "JSONDATATEST");

//type: "VertexColorNode"
export class VertexColor extends Node {
  name = "VertexColor";
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
// console.log(vertexColor().toJSON(), "vertexColor", "JSONDATATEST");
export const AttributeNodes = {
  UV,
  VertexColor,
};
