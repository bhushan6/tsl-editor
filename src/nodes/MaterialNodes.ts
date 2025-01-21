import { Input, schema, Node } from "../nodl-core";
import { z } from "zod";

import { vec4 } from "three/tsl";

export class MeshStandardMaterialNode extends Node {
  name = "Mesh Standard Material";
  inputs = {
    BaseColor: new Input({
      name: "Base Color",
      type: schema(z.any()),
      defaultValue: () => vec4(1, 0, 0, 1),
    }),
  };
  outputs = {};
  public code = (args: string[]) => {
    const argsString = !this.inputs.BaseColor.connected
      ? `vec4(1, 0, 0, 1)`
      : args.join(", ");
    return {
      code: `return ${argsString}`,
      dependencies: ["vec4"],
    };
  };
}

export const MaterialNodes = { MeshStandardMaterialNode };
