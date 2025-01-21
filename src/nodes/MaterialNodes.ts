import { Input, schema, Node } from "../nodl-core";
import { z } from "zod";

import { positionLocal, vec4 } from "three/tsl";

export class MeshStandardMaterialNode extends Node {
  name = "Mesh Standard Material";
  inputs = {
    colorNode: new Input({
      name: "colorNode",
      type: schema(z.any()),
      defaultValue: () => vec4(1, 0, 0, 1),
    }),
    positionNode: new Input({
      name: "positionNode",
      type: schema(z.any()),
      defaultValue: () => positionLocal,
    })
  };

  outputs = {};

  public code = (args: string[]) => {
    const argsString = !this.inputs.colorNode.connected
      ? `vec4(1, 0, 0, 1)`
      : args.join(", ");
    return {
      code: `return ${argsString}`,
      dependencies: ["vec4"],
    };
  };
}

export const MaterialNodes = { MeshStandardMaterialNode };
