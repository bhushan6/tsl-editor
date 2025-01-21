import { float, remap, remapClamp, hash, range, oscSine, oscSquare, oscTriangle, oscSawtooth, time } from "three/tsl";
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

export class Hash extends Node {
  public name: string = "Hash";
  public inputs: Record<string, Input<any>> = {
    a: new Input({
      name: "Node",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => evaluateInputs(inputs, hash))
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
      code: `const ${varName} = hash(${argsString})`,
      dependencies: ["hash"],
    };
  };
}

export class Range extends Node {
  public name: string = "Range";
  public inputs: Record<string, Input<any>> = {
    b: new Input({
      name: "min",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
    c: new Input({
      name: "max",
      type: schema(z.any()),
      defaultValue: () => 1,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => evaluateInputs(inputs, range))
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
      code: `const ${varName} = range(${argsString})`,
      dependencies: ["range"],
    };
  }
}


export class OscSine extends Node {
  public name: string = "OscSine";
  public inputs: Record<string, Input<any>> = {
    a: new Input({
      name: "Timer",
      type: schema(z.any()),
      defaultValue: () => time,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.a]).pipe(
        map((inputs) => () => oscSine(inputs[0]()))
      ),
    }),
  };
  public code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? "time" : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = oscSine(${argsString})`,
      dependencies: ["oscSine", "time"],
    };
  }
}

export class OscSquare extends Node {
  public name: string = "OscSquare";
  public inputs: Record<string, Input<any>> = {
    a: new Input({
      name: "Timer",
      type: schema(z.any()),
      defaultValue: () => time,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.a]).pipe(
        map((inputs) => () => oscSquare(inputs[0]()))
      ),
    }),
  };
  public code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? "time" : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = oscSquare(${argsString})`,
      dependencies: ["oscSquare", "time"],
    };
  }
}

export class OscTriangle extends Node {
  public name: string = "OscTriangle";
  public inputs: Record<string, Input<any>> = {
    a: new Input({
      name: "Timer",
      type: schema(z.any()),
      defaultValue: () => time,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.a]).pipe(
        map((inputs) => () => oscTriangle(inputs[0]()))
      ),
    }),
  };
  public code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? "time" : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = oscTriangle(${argsString})`,
      dependencies: ["oscTriangle", "time"],
    };
  }
}

export class OscSawtooth extends Node {
  public name: string = "OscSawtooth";
  public inputs: Record<string, Input<any>> = {
    a: new Input({
      name: "Timer",
      type: schema(z.any()),
      defaultValue: () => time,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.a]).pipe(
        map((inputs) => () => oscSawtooth(inputs[0]()))
      ),
    }),
  };
  public code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? "time" : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = oscSawtooth(${argsString})`,
      dependencies: ["oscSawtooth", "time"],
    };
  }
}

export const UtilityNodes = { Remap, RemapClamp, Hash, Range, OscSine, OscSquare, OscTriangle, OscSawtooth };
