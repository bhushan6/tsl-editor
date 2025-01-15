import { Input, Output, schema, Node } from "../nodl-core";
import { z } from "zod";
import { vec2, vec3, vec4, float, int, uint, bool, color } from "three/tsl";
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
    console.log(args);

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
};
