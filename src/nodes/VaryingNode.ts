import { varying } from "three/tsl";
import { Input, Output, schema, Node } from "../nodl-core";
import { z } from "zod";
import { combineLatest, map } from "rxjs";
import { createVarNameForNode } from "./utils";

export class Varying extends Node {
  name = "Varying";
  inputs = {
    a: new Input({
      name: "Node",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    varying: new Output({
      name: "Varying",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.a]).pipe(
        map((inputs) => () => varying(inputs[0]()))
      ),
    }),
  };
  public code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? "0" : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = varying(${argsString})`,
      dependencies: ["varying"],
    };
  };
}

export const VaryingNode = {
    Varying
}