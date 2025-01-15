import { Input, Output, schema, Node } from "../nodl-core";
import { z } from "zod";
import {
  add,
  mul,
  sub,
  div,
  abs,
  acos,
  asin,
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
  sin,
  mod,
} from "three/tsl";
import { combineLatest, map } from "rxjs";
import { createVarNameForNode } from "./utils";

const AddInputSchema = schema(z.any());

export class Add extends Node {
  name = "Add";
  inputs = {
    a: new Input({
      name: "Value",
      type: AddInputSchema,
      defaultValue: () => 0,
    }),
    b: new Input({
      name: "Value2",
      type: AddInputSchema,
      defaultValue: () => 0,
    }),
  };

  outputs = {
    output: new Output({
      name: "Output",
      type: AddInputSchema,
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => {
          return () => add(...inputs.map((i) => i()));
        })
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
      code: `const ${varName} = add(${argsString})`,
      dependencies: ["add"],
    };
  };

  // addInputPort = () => {
  //   const inputIndex = Object.keys(this.inputs).length;
  //   this.inputs = {
  //     ...this.inputs,
  //     [`input${inputIndex}`]: new Input({
  //       name: `Input${inputIndex}`,
  //       type: schema(z.any()),
  //       defaultValue: () => 0,
  //     }),
  //   };

  //   const inputs = Object.values(this.inputs);
  //   const newObservable = combineLatest(inputs).pipe(
  //     map((inputs) => {
  //       return () => add(...inputs.map((i) => i()));
  //     })
  //   );

  //   this.outputs.output.updateObservable(newObservable);

  //   this.onUpdate();
  // };

  // onUpdate = () => {};

  // addOnUpdate = (fn: () => void) => {
  //   this.onUpdate = fn;
  // };
}

export class Mul extends Node {
  name = "mul";
  inputs = {
    a: new Input({
      name: "Value",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
    b: new Input({
      name: "Value2",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => {
          return () => mul(...inputs.map((i) => i()));
        })
      ),
    }),
  };
  public code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? 0 : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = mul(${argsString})`,
      dependencies: ["mul"],
    };
  };
}

export class Sub extends Node {
  name = "sub";
  inputs = {
    a: new Input({
      name: "Value",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
    b: new Input({
      name: "Value2",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => {
          return () => sub(...inputs.map((i) => i()));
        })
      ),
    }),
  };
  public code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? 0 : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = sub(${argsString})`,
      dependencies: ["sub"],
    };
  };
}

export class Div extends Node {
  name = "div";
  inputs = {
    a: new Input({
      name: "Value",
      type: schema(z.any()),
      defaultValue: () => 1,
    }),
    b: new Input({
      name: "Value2",
      type: schema(z.any()),
      defaultValue: () => 1,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => {
          return () => div(...inputs.map((i) => i()));
        })
      ),
    }),
  };
  public code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? 0 : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = div(${argsString})`,
      dependencies: ["div"],
    };
  };
}

//create Nodes for above functions
export class Abs extends Node {
  name = "abs";
  inputs = {
    a: new Input({
      name: "Value",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => {
          return () => abs(...inputs.map((i) => i()));
        })
      ),
    }),
  };
  public code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? 0 : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = abs(${argsString})`,
      dependencies: ["abs"],
    };
  };
}
// Helper function to evaluate inputs
const evaluateInputs = (inputs: any[], func: (...args: any[]) => any) => {
  return () => func(...inputs.map((i) => i()));
};

export class Acos extends Node {
  name = "acos";
  inputs = {
    a: new Input({
      name: "Value",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => evaluateInputs(inputs, acos))
      ),
    }),
  };
  code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? 0 : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = acos(${argsString})`,
      dependencies: ["acos"],
    };
  };
}

export class Asin extends Node {
  name = "asin";
  inputs = {
    a: new Input({
      name: "Value",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => evaluateInputs(inputs, asin))
      ),
    }),
  };
  code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? 0 : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = asin(${argsString})`,
      dependencies: ["asin"],
    };
  };
}

export class Atan extends Node {
  name = "atan";
  inputs = {
    y: new Input({
      name: "Y",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
    x: new Input({
      name: "X",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => evaluateInputs(inputs, atan2))
      ),
    }),
  };
  code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? 0 : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = atan2(${argsString})`,
      dependencies: ["atan2"],
    };
  };
}

export class Clamp extends Node {
  name = "clamp";
  inputs = {
    x: new Input({
      name: "Value",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
    min: new Input({
      name: "Min",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
    max: new Input({
      name: "Max",
      type: schema(z.any()),
      defaultValue: () => 1,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => evaluateInputs(inputs, clamp))
      ),
    }),
  };
  code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? 0 : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = clamp(${argsString})`,
      dependencies: ["clamp"],
    };
  };
}

export class Ceil extends Node {
  name = "ceil";
  inputs = {
    a: new Input({
      name: "Value",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),

      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => evaluateInputs(inputs, ceil))
      ),
    }),
  };
  code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? 0 : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = ceil(${argsString})`,
      dependencies: ["ceil"],
    };
  };
}

export class Cos extends Node {
  name = "cos";
  inputs = {
    a: new Input({
      name: "Value",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => evaluateInputs(inputs, cos))
      ),
    }),
  };
  code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? 0 : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = cos(${argsString})`,
      dependencies: ["cos"],
    };
  };
}

export class Sin extends Node {
  name = "sin";
  inputs = {
    a: new Input({
      name: "Value",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => evaluateInputs(inputs, sin))
      ),
    }),
  };
  code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? 0 : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = sin(${argsString})`,
      dependencies: ["sin"],
    };
  };
}

export class Cross extends Node {
  name = "cross";
  inputs = {
    x: new Input({
      name: "Vector A",
      type: schema(z.any()),
      defaultValue: () => [0, 0, 0],
    }),
    y: new Input({
      name: "Vector B",
      type: schema(z.any()),
      defaultValue: () => [0, 0, 0],
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => evaluateInputs(inputs, cross))
      ),
    }),
  };
  code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? 0 : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = cross(${argsString})`,
      dependencies: ["cross"],
    };
  };
}

export class Mod extends Node {
  name = "mod";
  inputs = {
    x: new Input({
      name: "Vector A",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
    y: new Input({
      name: "Vector B",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => evaluateInputs(inputs, mod))
      ),
    }),
  };
  code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? "0" : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = mod(${argsString})`,
      dependencies: ["mod"],
    };
  };
}

export class Degrees extends Node {
  name = "degrees";
  inputs = {
    a: new Input({
      name: "Radians",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => evaluateInputs(inputs, degrees))
      ),
    }),
  };
  code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? 0 : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = degrees(${argsString})`,
      dependencies: ["degrees"],
    };
  };
}

export class Distance extends Node {
  name = "distance";
  inputs = {
    x: new Input({
      name: "Point A",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
    y: new Input({
      name: "Point B",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => evaluateInputs(inputs, distance))
      ),
    }),
  };
  code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? `0` : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = distance(${argsString})`,
      dependencies: ["distance"],
    };
  };
}

export class Dot extends Node {
  name = "dot";
  inputs = {
    x: new Input({
      name: "Vector A",
      type: schema(z.any()),
      defaultValue: () => [0, 0, 0],
    }),
    y: new Input({
      name: "Vector B",
      type: schema(z.any()),
      defaultValue: () => [0, 0, 0],
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => evaluateInputs(inputs, dot))
      ),
    }),
  };
  code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? `0` : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = dot(${argsString})`,
      dependencies: ["dot"],
    };
  };
}

export class Floor extends Node {
  name = "floor";
  inputs = {
    a: new Input({
      name: "Value",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => evaluateInputs(inputs, floor))
      ),
    }),
  };
  code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? `0` : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = floor(${argsString})`,
      dependencies: ["floor"],
    };
  };
}

export class Fract extends Node {
  name = "fract";
  inputs = {
    a: new Input({
      name: "Value",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => evaluateInputs(inputs, fract))
      ),
    }),
  };
  code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? `0` : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = fract(${argsString})`,
      dependencies: ["fract"],
    };
  };
}

export class Length extends Node {
  name = "length";
  inputs = {
    a: new Input({
      name: "Vector",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => evaluateInputs(inputs, length))
      ),
    }),
  };
  code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? `0` : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = length(${argsString})`,
      dependencies: ["length"],
    };
  };
}

export class Log extends Node {
  name = "log";
  inputs = {
    a: new Input({
      name: "Value",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => evaluateInputs(inputs, log))
      ),
    }),
  };
  code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        return !input.connected ? `0` : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = log(${argsString})`,
      dependencies: ["log"],
    };
  };
}

export const MathNodes = {
  Add,
  Mul,
  Sub,
  Div,
  Abs,
  Clamp,
  Ceil,
  Cos,
  Cross,
  Degrees,
  Distance,
  Dot,
  Floor,
  Fract,
  Length,
  Log,
  Sin,
  Mod,
};
