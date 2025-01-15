import { Input, Output, schema, Node } from "../nodl-core";
import { z } from "zod";

import { vec4, Fn } from "three/tsl";
import { combineLatest, map } from "rxjs";

const BaseColorSchema = schema(z.any());
export class MeshStandardMaterialNode extends Node {
  name = "Mesh Standard Material";
  inputs = {
    a: new Input({
      name: "Base Color",
      type: schema(z.any()),
      defaultValue: () => vec4(1, 0, 0, 1),
    }),
  };
  outputs = {
    value: new Output({
      name: "Value",
      type: BaseColorSchema,
      observable: combineLatest([this.inputs.a]).pipe(
        map((inputs) => {
          const i = inputs[0]();
          return Fn(() => i);
        })
      ),
    }),
  };
  public code = (args: string[]) => {
    const argsString = !this.inputs.a.connected
      ? `vec4(1, 0, 0, 1)`
      : args.join(", ");
    return {
      code: `return ${argsString}`,
      dependencies: ["vec4"],
    };
  };
}

export const MaterialNodes = { MeshStandardMaterialNode };
