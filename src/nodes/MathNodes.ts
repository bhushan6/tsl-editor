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
  normalize,
  mix,
  sqrt,
  pow2,
  pow,
  vec3,
  vec2,
} from "three/tsl";
import { combineLatest, map } from "rxjs";
import { createVarNameForNode, evaluateInputs } from "./utils";

// Type system for operator checking
export interface IOperatorNode {
  isOperator: true;
}

type InputConfig = {
  name: string;
  defaultValue: any;
};

type NodeConfig = {
  name: string;
  inputs: Record<string, InputConfig>;
  operation: Function;
  defaultValues?: Record<string, number | number[]>;
};

function createOperatorNode(config: NodeConfig) {
  return class OperatorNode extends Node implements IOperatorNode {
    isOperator = true as const;
    name = config.name;

    public operation =  config.operation
    
    inputs = Object.entries(config.inputs).reduce((acc, [key, inputConfig]) => {
      acc[key] = new Input({
        name: inputConfig.name,
        type: schema(z.any()),
        defaultValue: () => inputConfig.defaultValue,
      });
      return acc;
    }, {} as Record<string, Input>);

    private _internalInputs = Object.keys(this.inputs).reduce((acc, key) => {
      acc[(key as keyof typeof this.inputs)] = {
        type: "FLOAT",
        value: { x: config.defaultValues?.[key] ?? 0 }
      };
      return acc;
    }, {} as Record<string, { type: "FLOAT" | "VEC2" | "VEC3", value: { x: number, y?: number, z?: number } }>);

    public setValue(inputKey: keyof typeof this.inputs, value: { 
      type: "FLOAT" | "VEC2" | "VEC3", 
      value: { x: number, y?: number, z?: number } 
    }) {
      const inputValues = Object.values(value.value);
      const newValue = value.type === "FLOAT" ? () => inputValues[0] :
        value.type === "VEC2" ? () => vec2(...inputValues) :
        () => vec3(...inputValues);

      this.inputs[inputKey].next(newValue);
      this._internalInputs[inputKey] = value;
    }

    outputs = {
      output: new Output({
        name: "Output",
        type: schema(z.any()),
        observable: combineLatest([...Object.values(this.inputs)]).pipe(
          map((inputs) => evaluateInputs(inputs, this.operation))
        ),
      }),
    };

    public code = (args: string[]) => {
      const argsString = Object.keys(this.inputs)
        .map((inputKey, i) => {
          const inKey = inputKey as keyof typeof this.inputs;
          const input = this.inputs[inKey];
          if (!input.connected) {
            const internalValue = this._internalInputs[inKey];
            if (internalValue.type === "FLOAT") {
              return internalValue.value.x;
            } else if (internalValue.type === "VEC2") {
              return `vec2(${internalValue.value.x}, ${internalValue.value.y})`;
            } else if (internalValue.type === "VEC3") {
              return `vec3(${internalValue.value.x}, ${internalValue.value.y}, ${internalValue.value.z})`;
            }
          }
          return args[i];
        })
        .filter((arg) => arg !== undefined && arg !== null)
        .join(", ");
      
      const varName = createVarNameForNode(this);
      return {
        code: `const ${varName} = ${config.operation.name}(${argsString})`,
        dependencies: [config.operation.name, "vec2", "vec3"],
      };
    };

    public serialize() {
      const base = super.serialize();
      const internalValue = Object.keys(this.inputs).reduce((acc, key) => {
        const inKey = key as keyof typeof this.inputs;
        if (!this.inputs[inKey].connected) {
          acc[inKey] = this._internalInputs[inKey];
        }
        return acc;
      }, {} as Record<string, { type: "FLOAT" | "VEC2" | "VEC3", value: { x: number, y?: number, z?: number } }>);

      base.internalValue = JSON.stringify(internalValue);
      return base;
    }

    public deserialize(data: string) {
      try {
        const parsedData = JSON.parse(data) as Record<string, {
          type: "FLOAT" | "VEC2" | "VEC3",
          value: { x: number, y?: number, z?: number }
        }>;

        Object.keys(parsedData).forEach((inputKey) => {
          const inKey = inputKey as keyof typeof this.inputs;
          this.setValue(inKey, parsedData[inKey]);
        });
      } catch (e) {
        console.error(e);
      }
    }
  };
}

// Helper function to check if a node is an operator
export function isOperatorNode(node: Node): node is Node & IOperatorNode {
  return 'isOperator' in node && node.isOperator === true;
}

export const Add = createOperatorNode({
  name: "Add",
  inputs: {
    a: { name: "Value", defaultValue: 0 },
    b: { name: "Value2", defaultValue: 0 }
  },
  operation: add
});

export const Sub = createOperatorNode({
  name: "Sub",
  inputs: {
    a: { name: "Value", defaultValue: 0 },
    b: { name: "Value2", defaultValue: 0 }
  },
  operation: sub
});

export const Mul = createOperatorNode({
  name: "Mul",
  inputs: {
    a: { name: "Value", defaultValue: 0 },
    b: { name: "Value2", defaultValue: 0 }
  },
  operation: mul
});

export const Div = createOperatorNode({
  name: "Div",
  inputs: {
    a: { name: "Value", defaultValue: 1 },
    b: { name: "Value2", defaultValue: 1 }
  },
  operation: div,
  defaultValues: {
    a: 1,
    b: 1
  }
});

// Trigonometric functions
export const Sin = createOperatorNode({
  name: "Sin",
  inputs: {
    a: { name: "Value", defaultValue: 0 }
  },
  operation: sin
});

export const Cos = createOperatorNode({
  name: "Cos",
  inputs: {
    a: { name: "Value", defaultValue: 0 }
  },
  operation: cos
});

export const Asin = createOperatorNode({
  name: "Asin",
  inputs: {
    a: { name: "Value", defaultValue: 0 }
  },
  operation: asin
});

export const Acos = createOperatorNode({
  name: "Acos",
  inputs: {
    a: { name: "Value", defaultValue: 0 }
  },
  operation: acos
});

export const Atan = createOperatorNode({
  name: "Atan",
  inputs: {
    y: { name: "Y", defaultValue: 0 },
    x: { name: "X", defaultValue: 0 }
  },
  operation: atan2
});

// Vector operations
export const Cross = createOperatorNode({
  name: "Cross",
  inputs: {
    x: { name: "Vector A", defaultValue: [0, 0, 0] },
    y: { name: "Vector B", defaultValue: [0, 0, 0] }
  },
  operation: cross,
  defaultValues: {
    x: 0,
    y: 0
  }
});

export const Dot = createOperatorNode({
  name: "Dot",
  inputs: {
    x: { name: "Vector A", defaultValue: [0, 0, 0] },
    y: { name: "Vector B", defaultValue: [0, 0, 0] }
  },
  operation: dot,
  defaultValues: {
    x: 0,
    y: 0
  }
});

export const Normalize = createOperatorNode({
  name: "Normalize",
  inputs: {
    x: { name: "Vector", defaultValue: [0, 0, 0] }
  },
  operation: normalize,
  defaultValues: {
    x: 0
  }
});

export const Length = createOperatorNode({
  name: "Length",
  inputs: {
    a: { name: "Vector", defaultValue: 0 }
  },
  operation: length
});

export const Distance = createOperatorNode({
  name: "Distance",
  inputs: {
    x: { name: "Point A", defaultValue: 0 },
    y: { name: "Point B", defaultValue: 0 }
  },
  operation: distance
});

// Mathematical functions
export const Abs = createOperatorNode({
  name: "Abs",
  inputs: {
    a: { name: "Value", defaultValue: 0 }
  },
  operation: abs
});

export const Sqrt = createOperatorNode({
  name: "Sqrt",
  inputs: {
    x: { name: "Value", defaultValue: 1 }
  },
  operation: sqrt,
  defaultValues: {
    x: 1
  }
});

export const Pow = createOperatorNode({
  name: "Pow",
  inputs: {
    x: { name: "Base", defaultValue: 1 },
    y: { name: "Exponent", defaultValue: 1 }
  },
  operation: pow,
  defaultValues: {
    x: 1,
    y: 1
  }
});

export const Pow2 = createOperatorNode({
  name: "Pow2",
  inputs: {
    x: { name: "Value", defaultValue: 1 }
  },
  operation: pow2,
  defaultValues: {
    x: 1
  }
});

export const Log = createOperatorNode({
  name: "Log",
  inputs: {
    a: { name: "Value", defaultValue: 0 }
  },
  operation: log
});

export const Floor = createOperatorNode({
  name: "Floor",
  inputs: {
    a: { name: "Value", defaultValue: 0 }
  },
  operation: floor
});

export const Ceil = createOperatorNode({
  name: "Ceil",
  inputs: {
    a: { name: "Value", defaultValue: 0 }
  },
  operation: ceil
});

export const Fract = createOperatorNode({
  name: "Fract",
  inputs: {
    a: { name: "Value", defaultValue: 0 }
  },
  operation: fract
});

// Conversion and utility functions
export const Degrees = createOperatorNode({
  name: "Degrees",
  inputs: {
    a: { name: "Radians", defaultValue: 0 }
  },
  operation: degrees
});

export const Mod = createOperatorNode({
  name: "Mod",
  inputs: {
    x: { name: "Vector A", defaultValue: 0 },
    y: { name: "Vector B", defaultValue: 0 }
  },
  operation: mod
});

export const Mix = createOperatorNode({
  name: "Mix",
  inputs: {
    x: { name: "Value A", defaultValue: 0 },
    y: { name: "Value B", defaultValue: 1 },
    a: { name: "Alpha", defaultValue: 0.5 }
  },
  operation: mix,
  defaultValues: {
    x: 0,
    y: 1,
    a: 0.5
  }
});

export const Clamp = createOperatorNode({
  name: "Clamp",
  inputs: {
    x: { name: "Value", defaultValue: 0 },
    min: { name: "Min", defaultValue: 0 },
    max: { name: "Max", defaultValue: 1 }
  },
  operation: clamp,
  defaultValues: {
    x: 0,
    min: 0,
    max: 1
  }
});

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
  Pow,
  Pow2,
  Sqrt,
  Mix,
  Normalize,
};
