import { float, remap, remapClamp } from "three/tsl";
import { Input, Node, Output, schema } from "../nodl-core";
import { z } from "zod";
import { combineLatest, map } from "rxjs";
import { createVarNameForNode, evaluateInputs } from "./utils";

export class Remap extends Node {
  public name: string = "Remap";
  public inputs: Record<string, Input<any>> = {
    a: new Input({
      name: "Node",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
    b: new Input({
      name: "inLow",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
    c: new Input({
      name: "inHigh",
      type: schema(z.any()),
      defaultValue: () => 1,
    }),
    d: new Input({
      name: "outLow",
      type: schema(z.any()),
      defaultValue: () => float(0),
    }),
    e: new Input({
      name: "outHigh",
      type: schema(z.any()),
      defaultValue: () => float(1),
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => evaluateInputs(inputs, remap))
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
      code: `const ${varName} = remap(${argsString})`,
      dependencies: ["remap"],
    };
  };
}

export class RemapClamp extends Node {
  public name: string = "RemapClamp";
  public inputs: Record<string, Input<any>> = {
    a: new Input({
      name: "Node",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
    b: new Input({
      name: "inLow",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
    c: new Input({
      name: "inHigh",
      type: schema(z.any()),
      defaultValue: () => 1,
    }),
    d: new Input({
      name: "outLow",
      type: schema(z.any()),
      defaultValue: () => float(0),
    }),
    e: new Input({
      name: "outHigh",
      type: schema(z.any()),
      defaultValue: () => float(1),
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => evaluateInputs(inputs, remapClamp))
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
      code: `const ${varName} = remapClamp(${argsString})`,
      dependencies: ["remapClamp"],
    };
  };
}

export const UtilityNodes = { Remap, RemapClamp };
