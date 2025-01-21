import { Input, Output, schema, Node } from "../nodl-core";
import { z } from "zod";
import { vec2, vec3, vec4, float, int, uint, bool, color, mat2, mat3, mat4, ivec2, ivec3, ivec4, bvec4, bvec3, bvec2, uvec4, uvec3, uvec2 } from "three/tsl";

import { combineLatest, map } from "rxjs";
import { createVarNameForNode } from "./utils";


export class Float extends Node {
  name = "Float";
  inputs = {
    a: new Input({
      name: "A",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    value: new Output({
      name: "Value",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.a]).pipe(
        map((inputs) => {
          return () => float(inputs[0]());
        })
      ),
    }),
  };
  public code = (args: string[]) => {
    const argsString = !this.inputs.a.connected
      ? `${this.inputs.a.getValue()()}`
      : args.length > 0
      ? args.join(", ")
      : "";
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = float(${argsString})`,
      dependencies: ["float"],
    };
  };
}

export class Int extends Node {
  name = "Int";
  inputs = {
    a: new Input({
      name: "A",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    value: new Output({
      name: "Value",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.a]).pipe(
        map((inputs) => {
          return () => int(inputs[0]());
        })
      ),
    }),
  };
  public code = (args: string[]) => {
    const argsString = !this.inputs.a.connected
      ? `${this.inputs.a.getValue()()}`
      : args.length > 0
      ? args.join(", ")
      : "";
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = int(${argsString})`,
      dependencies: ["int"],
    };
  };
}

export class Uint extends Node {
  name = "Uint";
  inputs = {
    a: new Input({
      name: "A",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    value: new Output({
      name: "Value",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.a]).pipe(
        map((inputs) => {
          return () => uint(inputs[0]());
        })
      ),
    }),
  };
  public code = (args: string[]) => {
    const argsString = !this.inputs.a.connected
      ? `${this.inputs.a.getValue()()}`
      : args.length > 0
      ? args.join(", ")
      : "";
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = uint(${argsString})`,
      dependencies: ["uint"],
    };
  };
}

const Vec2Schema = schema(z.any());
export class Vec2 extends Node {
  name = "Vec2";
  inputs = {
    a: new Input({ name: "A", type: Vec2Schema, defaultValue: () => 0 }),
    b: new Input({ name: "B", type: Vec2Schema, defaultValue: () => 0 }),
  };
  outputs = {
    value: new Output({
      name: "Value",
      type: Vec2Schema,
      observable: combineLatest([this.inputs.a, this.inputs.b]).pipe(
        map((inputs) => {
          return () => vec2(...inputs.map((i) => i()));
        })
      ),
    }),
  };
  public code = (args: string[]) => {
    let index = 0;
    const argsString = Object.values(this.inputs)
      .map((input) => {
        console.log(input.name, input.connected);

        if (input.connected) {
          const arg = args[index];
          index++;
          return arg;
        }
        return `${input.getValue()()}`;
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = vec2(${argsString})`,
      dependencies: ["vec2"],
    };
  };
}

const Vec3Schema = schema(z.any());
export class Vec3 extends Node {
  name = "Vec3";
  inputs = {
    a: new Input({
      name: "A",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
    b: new Input({
      name: "B",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
    c: new Input({
      name: "C",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    value: new Output({
      name: "Value",
      type: Vec3Schema,
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => {
          return () => vec3(...inputs.map((i) => i()));
        })
      ),
    }),
  };
  code = (args: string[]) => {
    let index = 0;
    const argsString = Object.values(this.inputs)
      .map((input) => {
        if (input.connected) {
          const arg = args[index];
          index++;
          return arg;
        }
        return input.getValue()();
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = vec3(${argsString})`,
      dependencies: ["vec3"],
    };
  };
}

const Vec4Schema = schema(z.any());
export class Vec4 extends Node {
  name = "Vec4";
  inputs = {
    a: new Input({
      name: "A",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
    b: new Input({
      name: "B",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
    c: new Input({
      name: "C",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
    d: new Input({
      name: "D",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    value: new Output({
      name: "Value",
      type: Vec4Schema,
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => {
          return () => vec4(...inputs.map((i) => i()));
        })
      ),
    }),
  };
  code = (args: string[]) => {
    let index = 0;
    const argsString = Object.values(this.inputs)
      .map((input) => {
        if (input.connected) {
          const arg = args[index];
          index++;
          return arg;
        }
        return input.getValue()();
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = vec4(${argsString})`,
      dependencies: ["vec4"],
    };
  };
}

export class SplitVec2 extends Node {
  name = "Split Vec2";
  inputs = {
    a: new Input({
      name: "A",
      type: schema(z.any()),
      defaultValue: () => vec2(1, 0),
    }),
  };
  outputs = {
    x: new Output({
      name: "X",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.a]).pipe(
        map((inputs) => () => inputs[0]().x)
      ),
    }),
    y: new Output({
      name: "Y",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.a]).pipe(
        map((inputs) => () => inputs[0]().y)
      ),
    }),
  };
  code = (args: string[]) => {
    const input = this.inputs.a.connected
      ? {
          x: `${args[0]}.x`,
          y: `${args[0]}.y`,
        }
      : this.inputs.a.getValue()();
    const varName = createVarNameForNode(this);
    return {
      code: `
        const ${varName}_X = ${`${input.x}`}
        const ${varName}_Y = ${`${input.y}`}
      `,
      dependencies: [],
    };
  };
}

export class SplitVec3 extends Node {
  name = "Split Vec3";
  inputs = {
    a: new Input({
      name: "A",
      // type: schema(z.function().returns())),
      type: schema(z.any()),
      defaultValue: () => vec3(1, 0, 1),
    }),
  };
  outputs = {
    x: new Output({
      name: "X",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.a]).pipe(
        map((inputs) => () => inputs[0]().x)
      ),
    }),
    y: new Output({
      name: "Y",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.a]).pipe(
        map((inputs) => () => inputs[0]().y)
      ),
    }),
    z: new Output({
      name: "Z",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.a]).pipe(
        map((inputs) => () => inputs[0]().z)
      ),
    }),
  };
  code = (args: string[]) => {
    const input = this.inputs.a.connected
      ? {
          x: `${args[0]}.x`,
          y: `${args[0]}.y`,
          z: `${args[0]}.z`,
        }
      : this.inputs.a.getValue()();
    const varName = createVarNameForNode(this);
    return {
      code: `
        const ${varName}_X = ${`${input.x}`}
        const ${varName}_Y = ${`${input.y}`}
        const ${varName}_Z = ${`${input.z}`}
      `,
      dependencies: [],
    };
  };
}

export class SplitVec4 extends Node {
  name = "Split Vec4";
  inputs = {
    a: new Input({
      name: "A",
      type: schema(z.any()),
      defaultValue: () => vec4(1, 0, 1, 1),
    }),
  };
  outputs = {
    x: new Output({
      name: "X",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.a]).pipe(
        map((inputs) => () => inputs[0]().x)
      ),
    }),
    y: new Output({
      name: "Y",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.a]).pipe(
        map((inputs) => () => inputs[0]().y)
      ),
    }),
    z: new Output({
      name: "Z",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.a]).pipe(
        map((inputs) => () => inputs[0]().z)
      ),
    }),
    w: new Output({
      name: "W",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.a]).pipe(
        map((inputs) => () => inputs[0]().w)
      ),
    }),
  };
  code = (args: string[]) => {
    const input = this.inputs.a.connected
      ? {
          x: `${args[0]}.x`,
          y: `${args[0]}.y`,
          z: `${args[0]}.z`,
          w: `${args[0]}.w`,
        }
      : this.inputs.a.getValue()();
    const varName = createVarNameForNode(this);
    return {
      code: `
        const ${varName}_X = ${`${input.x}`}
        const ${varName}_Y = ${`${input.y}`}
        const ${varName}_Z = ${`${input.z}`}
        const ${varName}_W = ${`${input.w}`}
      `,
      dependencies: [],
    };
  };
}

export class Boolean extends Node {
  name = "Boolean";
  inputs = {
    a: new Input({
      name: "A",
      type: schema(z.any()),
      defaultValue: () => false,
    }),
  };
  outputs = {
    value: new Output({
      name: "Value",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.a]).pipe(
        map((inputs) => {
          return () => bool(inputs[0]());
        })
      ),
    }),
  };
  public code = (args: string[]) => {
    const argsString = !this.inputs.a.connected
      ? `${this.inputs.a.getValue()()}`
      : args.length > 0
      ? args.join(", ")
      : "";
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = bool(${argsString})`,
      dependencies: ["bool"],
    };
  };
}

export class Color extends Node {
  name = "Color";
  inputs = {
    r: new Input({ name: "R", type: schema(z.any()), defaultValue: () => 1 }),
    g: new Input({ name: "G", type: schema(z.any()), defaultValue: () => 1 }),
    b: new Input({ name: "B", type: schema(z.any()), defaultValue: () => 1 }),
  };
  outputs = {
    value: new Output({
      name: "Value",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.r, this.inputs.g, this.inputs.b]).pipe(
        map((inputs) => {
          return () => color(...inputs.map((i) => i()));
        })
      ),
    }),
  };
  code = (args: string[]) => {
    let index = 0;
    const argsString = Object.values(this.inputs)
      .map((input) => {
        if (input.connected) {
          const arg = args[index];
          index++;
          return arg;
        }
        return input.getValue()();
      })
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = color(${argsString})`,
      dependencies: ["color"],
    };
  };
}

export class Mat2 extends Node {
  name = "Mat2";
  inputs = {
    a: new Input({ name: "A", type: schema(z.any()), defaultValue: () => 1 }),
    b: new Input({ name: "B", type: schema(z.any()), defaultValue: () => 0 }),
    c: new Input({ name: "C", type: schema(z.any()), defaultValue: () => 0 }),
    d: new Input({ name: "D", type: schema(z.any()), defaultValue: () => 1 }),
  };
  outputs = {
    value: new Output({
      name: "Value",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => {
          return () => mat2(...inputs.map((i) => i()));
        })
      ),
    }),
  };
  code = (args: string[]) => {
    let index = 0;
    const argsString = Object.values(this.inputs)
      .map((input) => {
        if (input.connected) {
          const arg = args[index];
          index++;
          return arg;
        }
        return input.getValue()();
      })
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = mat2(${argsString})`,
      dependencies: ["mat2"],
    };
  };
}

export class Mat3 extends Node {
  name = "Mat3";
  inputs = {
    a: new Input({ name: "A", type: schema(z.any()), defaultValue: () => 1 }),
    b: new Input({ name: "B", type: schema(z.any()), defaultValue: () => 0 }),
    c: new Input({ name: "C", type: schema(z.any()), defaultValue: () => 0 }),
    d: new Input({ name: "D", type: schema(z.any()), defaultValue: () => 0 }),
    e: new Input({ name: "E", type: schema(z.any()), defaultValue: () => 1 }),
    f: new Input({ name: "F", type: schema(z.any()), defaultValue: () => 0 }),
    g: new Input({ name: "G", type: schema(z.any()), defaultValue: () => 0 }),
    h: new Input({ name: "H", type: schema(z.any()), defaultValue: () => 0 }),
    i: new Input({ name: "I", type: schema(z.any()), defaultValue: () => 1 }),
  };
  outputs = {
    value: new Output({
      name: "Value",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => {
          return () => mat3(...inputs.map((i) => i()));
        })
      ),
    }),
  };
  code = (args: string[]) => {
    let index = 0;
    const argsString = Object.values(this.inputs)
      .map((input) => {
        if (input.connected) {
          const arg = args[index];
          index++;
          return arg;
        }
        return input.getValue()();
      })
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = mat3(${argsString})`,
      dependencies: ["mat3"],
    };
  };
}

export class Mat4 extends Node {
  name = "Mat4";
  inputs = {
    a: new Input({ name: "A", type: schema(z.any()), defaultValue: () => 1 }),
    b: new Input({ name: "B", type: schema(z.any()), defaultValue: () => 0 }),
    c: new Input({ name: "C", type: schema(z.any()), defaultValue: () => 0 }),
    d: new Input({ name: "D", type: schema(z.any()), defaultValue: () => 0 }),
    e: new Input({ name: "E", type: schema(z.any()), defaultValue: () => 0 }),
    f: new Input({ name: "F", type: schema(z.any()), defaultValue: () => 1 }),
    g: new Input({ name: "G", type: schema(z.any()), defaultValue: () => 0 }),
    h: new Input({ name: "H", type: schema(z.any()), defaultValue: () => 0 }),
    i: new Input({ name: "I", type: schema(z.any()), defaultValue: () => 0 }),
    j: new Input({ name: "J", type: schema(z.any()), defaultValue: () => 0 }),
    k: new Input({ name: "K", type: schema(z.any()), defaultValue: () => 1 }),
    l: new Input({ name: "L", type: schema(z.any()), defaultValue: () => 0 }),
    m: new Input({ name: "M", type: schema(z.any()), defaultValue: () => 0 }),
    n: new Input({ name: "N", type: schema(z.any()), defaultValue: () => 0 }),
    o: new Input({ name: "O", type: schema(z.any()), defaultValue: () => 0 }),
    p: new Input({ name: "P", type: schema(z.any()), defaultValue: () => 1 }),
  };
  outputs = {
    value: new Output({
      name: "Value",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => {
          return () => mat4(...inputs.map((i) => i()));
        })
      ),
    }),
  };
  code = (args: string[]) => {
    let index = 0;
    const argsString = Object.values(this.inputs)
      .map((input) => {
        if (input.connected) {
          const arg = args[index];
          index++;
          return arg;
        }
        return input.getValue()();
      })
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = mat4(${argsString})`,
      dependencies: ["mat4"],
    };
  };
}

// Integer Vector Classes
export class IVec2 extends Node {
  name = "IVec2";
  inputs = {
    x: new Input({ name: "X", type: schema(z.any()), defaultValue: () => 0 }),
    y: new Input({ name: "Y", type: schema(z.any()), defaultValue: () => 0 }),
  };
  outputs = {
    value: new Output({
      name: "Value", 
      type: schema(z.any()),
      observable: combineLatest([this.inputs.x, this.inputs.y]).pipe(
        map((inputs) => {
          return () => ivec2(...inputs.map((i) => i()));
        })
      ),
    }),
  };
  code = (args: string[]) => {
    let index = 0;
    const argsString = Object.values(this.inputs)
      .map((input) => {
        if (input.connected) {
          const arg = args[index];
          index++;
          return arg;
        }
        return input.getValue()();
      })
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = ivec2(${argsString})`,
      dependencies: ["ivec2"],
    };
  };
}

export class IVec3 extends Node {
  name = "IVec3";
  inputs = {
    x: new Input({ name: "X", type: schema(z.any()), defaultValue: () => 0 }),
    y: new Input({ name: "Y", type: schema(z.any()), defaultValue: () => 0 }),
    z: new Input({ name: "Z", type: schema(z.any()), defaultValue: () => 0 }),
  };
  outputs = {
    value: new Output({
      name: "Value",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => {
          return () => ivec3(...inputs.map((i) => i()));
        })
      ),
    }),
  };
  code = (args: string[]) => {
    let index = 0;
    const argsString = Object.values(this.inputs)
      .map((input) => {
        if (input.connected) {
          const arg = args[index];
          index++;
          return arg;
        }
        return input.getValue()();
      })
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = ivec3(${argsString})`,
      dependencies: ["ivec3"],
    };
  };
}

export class IVec4 extends Node {
  name = "IVec4";
  inputs = {
    x: new Input({ name: "X", type: schema(z.any()), defaultValue: () => 0 }),
    y: new Input({ name: "Y", type: schema(z.any()), defaultValue: () => 0 }),
    z: new Input({ name: "Z", type: schema(z.any()), defaultValue: () => 0 }),
    w: new Input({ name: "W", type: schema(z.any()), defaultValue: () => 0 }),
  };
  outputs = {
    value: new Output({
      name: "Value",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => {
          return () => ivec4(...inputs.map((i) => i()));
        })
      ),
    }),
  };
  code = (args: string[]) => {
    let index = 0;
    const argsString = Object.values(this.inputs)
      .map((input) => {
        if (input.connected) {
          const arg = args[index];
          index++;
          return arg;
        }
        return input.getValue()();
      })
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = ivec4(${argsString})`,
      dependencies: ["ivec4"],
    };
  };
}

// Unsigned Integer Vector Classes
export class UVec2 extends Node {
  name = "UVec2";
  inputs = {
    x: new Input({ name: "X", type: schema(z.any()), defaultValue: () => 0 }),
    y: new Input({ name: "Y", type: schema(z.any()), defaultValue: () => 0 }),
  };
  outputs = {
    value: new Output({
      name: "Value",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.x, this.inputs.y]).pipe(
        map((inputs) => {
          return () => uvec2(...inputs.map((i) => i()));
        })
      ),
    }),
  };
  code = (args: string[]) => {
    let index = 0;
    const argsString = Object.values(this.inputs)
      .map((input) => {
        if (input.connected) {
          const arg = args[index];
          index++;
          return arg;
        }
        return input.getValue()();
      })
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = uvec2(${argsString})`,
      dependencies: ["uvec2"],
    };
  };
}

export class UVec3 extends Node {
  name = "UVec3";
  inputs = {
    x: new Input({ name: "X", type: schema(z.any()), defaultValue: () => 0 }),
    y: new Input({ name: "Y", type: schema(z.any()), defaultValue: () => 0 }),
    z: new Input({ name: "Z", type: schema(z.any()), defaultValue: () => 0 }),
  };
  outputs = {
    value: new Output({
      name: "Value",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => {
          return () => uvec3(...inputs.map((i) => i()));
        })
      ),
    }),
  };
  code = (args: string[]) => {
    let index = 0;
    const argsString = Object.values(this.inputs)
      .map((input) => {
        if (input.connected) {
          const arg = args[index];
          index++;
          return arg;
        }
        return input.getValue()();
      })
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = uvec3(${argsString})`,
      dependencies: ["uvec3"],
    };
  };
}

export class UVec4 extends Node {
  name = "UVec4";
  inputs = {
    x: new Input({ name: "X", type: schema(z.any()), defaultValue: () => 0 }),
    y: new Input({ name: "Y", type: schema(z.any()), defaultValue: () => 0 }),
    z: new Input({ name: "Z", type: schema(z.any()), defaultValue: () => 0 }),
    w: new Input({ name: "W", type: schema(z.any()), defaultValue: () => 0 }),
  };
  outputs = {
    value: new Output({
      name: "Value",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => {
          return () => uvec4(...inputs.map((i) => i()));
        })
      ),
    }),
  };
  code = (args: string[]) => {
    let index = 0;
    const argsString = Object.values(this.inputs)
      .map((input) => {
        if (input.connected) {
          const arg = args[index];
          index++;
          return arg;
        }
        return input.getValue()();
      })
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = uvec4(${argsString})`,
      dependencies: ["uvec4"],
    };
  };
}

// Boolean Vector Classes
export class BVec2 extends Node {
  name = "BVec2";
  inputs = {
    x: new Input({ name: "X", type: schema(z.any()), defaultValue: () => false }),
    y: new Input({ name: "Y", type: schema(z.any()), defaultValue: () => false }),
  };
  outputs = {
    value: new Output({
      name: "Value",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.x, this.inputs.y]).pipe(
        map((inputs) => {
          return () => bvec2(...inputs.map((i) => i()));
        })
      ),
    }),
  };
  code = (args: string[]) => {
    let index = 0;
    const argsString = Object.values(this.inputs)
      .map((input) => {
        if (input.connected) {
          const arg = args[index];
          index++;
          return arg;
        }
        return input.getValue()();
      })
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = bvec2(${argsString})`,
      dependencies: ["bvec2"],
    };
  };
}

export class BVec3 extends Node {
  name = "BVec3";
  inputs = {
    x: new Input({ name: "X", type: schema(z.any()), defaultValue: () => false }),
    y: new Input({ name: "Y", type: schema(z.any()), defaultValue: () => false }),
    z: new Input({ name: "Z", type: schema(z.any()), defaultValue: () => false }),
  };
  outputs = {
    value: new Output({
      name: "Value",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => {
          return () => bvec3(...inputs.map((i) => i()));
        })
      ),
    }),
  };
  code = (args: string[]) => {
    let index = 0;
    const argsString = Object.values(this.inputs)
      .map((input) => {
        if (input.connected) {
          const arg = args[index];
          index++;
          return arg;
        }
        return input.getValue()();
      })
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = bvec3(${argsString})`,
      dependencies: ["bvec3"],
    };
  };
}

export class BVec4 extends Node {
  name = "BVec4";
  inputs = {
    x: new Input({ name: "X", type: schema(z.any()), defaultValue: () => false }),
    y: new Input({ name: "Y", type: schema(z.any()), defaultValue: () => false }),
    z: new Input({ name: "Z", type: schema(z.any()), defaultValue: () => false }),
    w: new Input({ name: "W", type: schema(z.any()), defaultValue: () => false }),
  };
  outputs = {
    value: new Output({
      name: "Value",
      type: schema(z.any()),
      observable: combineLatest([...Object.values(this.inputs)]).pipe(
        map((inputs) => {
          return () => bvec4(...inputs.map((i) => i()));
        })
      ),
    }),
  };
  code = (args: string[]) => {
    let index = 0;
    const argsString = Object.values(this.inputs)
      .map((input) => {
        if (input.connected) {
          const arg = args[index];
          index++;
          return arg;
        }
        return input.getValue()();
      })
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = bvec4(${argsString})`,
      dependencies: ["bvec4"],
    };
  };
}


export const ConstantNodes = {
  Float,
  Vec2,
  Vec3,
  Vec4,
  SplitVec2,
  SplitVec3,
  SplitVec4,
  Int,
  Uint,

  Boolean,
  Color,
  Mat2,
  Mat3,
  Mat4,
  IVec2,
  IVec3,
  IVec4,
  UVec2,
  UVec3,
  UVec4,
  BVec2,
  BVec3,
  BVec4,
};
