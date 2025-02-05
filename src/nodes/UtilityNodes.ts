import {
  float,
  remap,
  remapClamp,
  hash,
  range,
  oscSine,
  oscSquare,
  oscTriangle,
  oscSawtooth,
  time ,
  matcapUV,
  rotateUV,
  uv,
  vec2,
  spherizeUV,
  spritesheetUV,
  positionWorldDirection,
  equirectUV,
} from "three/tsl";
import { Input, Node, Output, schema } from "../nodl-core";
import { z } from "zod";
import { combineLatest, map, of } from "rxjs";
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
  };
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
  };
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
  };
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
  };
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
  };
}

// matcapUV	UV coordinates for matcap texture.	vec2
// rotateUV( uv, rotation, centerNode = vec2( 0.5 ) )	Rotates UV coordinates around a center point.	vec2
// spherizeUV( uv, strength, centerNode = vec2( 0.5 ) )	Distorts UV coordinates with a spherical effect around a center point.	vec2
// spritesheetUV( count, uv = uv(), frame = float( 0 ) )	Computes UV coordinates for a sprite sheet based on the number of frames, UV coordinates, and frame index.	vec2
// equirectUV( direction = positionWorldDirection )	Computes UV coordinates for equirectangular mapping based on the direction vector.	vec2

export class MatcapUv extends Node {
  public name: string = "MatcapUV";
  public inputs: Record<string, Input<any>> = {};
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: of(() => matcapUV),
    }),
  };
  code = () => {
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = matcapUV`,
      dependencies: ["matcapUV"],
    };
  };
}

export class RotateUV extends Node {
  public name: string = "RotateUV";
  public inputs: Record<string, Input<any>> = {
    uv: new Input({
      name: "UV",
      type: schema(z.any()),
      defaultValue: uv,
    }),
    rotation: new Input({
      name: "Rotation",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
    center: new Input({
      name: "Center",
      type: schema(z.any()),
      defaultValue: () => vec2(0.5),
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([
        this.inputs.uv,
        this.inputs.rotation,
        this.inputs.center,
      ]).pipe(
        map((inputs) => () => rotateUV(inputs[0](), inputs[1](), inputs[2]()))
      ),
    }),
  };
  code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        const defaultValues = ["uv", "0", "vec2(0.5)"];
        return !input.connected ? defaultValues[i] : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = rotateUV(${argsString})`,
      dependencies: ["rotateUV", "uv"],
    };
  };
}

export class SpherizeUV extends Node {
  public name: string = "SpherizeUV";
  public inputs: Record<string, Input<any>> = {
    uv: new Input({
      name: "UV",
      type: schema(z.any()),
      defaultValue: () => positionWorldDirection,
    }),
    strength: new Input({
      name: "Strength",
      type: schema(z.any()),
      defaultValue: () => 1,
    }),
    center: new Input({
      name: "Center",
      type: schema(z.any()),
      defaultValue: () => vec2(0.5),
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([
        this.inputs.uv,
        this.inputs.strength,
        this.inputs.center,
      ]).pipe(
        map((inputs) => () => spherizeUV(inputs[0](), inputs[1](), inputs[2]()))
      ),
    }),
  };
  code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        const defaultValues = ["uv", "1", "vec2(0.5)"];
        return !input.connected ? defaultValues[i] : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = spherizeUV(${argsString})`,
      dependencies: ["spherizeUV", "uv"],
    };
  };
}

export class SpritesheetUV extends Node {
  public name: string = "SpritesheetUV";
  public inputs: Record<string, Input<any>> = {
    count: new Input({
      name: "Count",
      type: schema(z.any()),
      defaultValue: () => 1,
    }),
    uv: new Input({
      name: "UV",
      type: schema(z.any()),
      defaultValue: uv,
    }),
    frame: new Input({
      name: "Frame",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: combineLatest([
        this.inputs.count,
        this.inputs.uv,
        this.inputs.frame,
      ]).pipe(
        map(
          (inputs) => () => spritesheetUV(inputs[0](), inputs[1](), inputs[2]())
        )
      ),
    }),
  };
  code = (args: string[]) => {
    const argsString = Object.values(this.inputs)
      .map((input, i) => {
        const defaultValues = ["1", "uv", "0"];
        return !input.connected ? defaultValues[i] : args[i];
      })
      .filter((arg) => arg !== undefined && arg !== null)
      .join(", ");
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = spritesheetUV(${argsString})`,
      dependencies: ["spritesheetUV", "uv"],
    };
  };
}

export class EquirectUV extends Node {
  public name: string = "EquirectUV";
  public inputs: Record<string, Input<any>> = {

  };
  outputs = {
    output: new Output({
      name: "Output",
      type: schema(z.any()),
      observable: of(() => equirectUV),
    }),
  };
  code = () => {
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = equirectUV`,
      dependencies: ["equirectUV"],
    };
  }
}
export const UtilityNodes = {
  Remap,
  RemapClamp,
  Hash,
  Range,
  OscSine,
  OscSquare,
  OscTriangle,
  OscSawtooth,
  MatcapUv,
  RotateUV,
  SpherizeUV,
  SpritesheetUV,
  EquirectUV,
};

// const time = uniform(0).onFrameUpdate(({ delta }) => {
//     time.value += delta * 2; // Speed multiplier
// });

// // Twist intensity control
// const twistAmount = uniform(3.0);

// // Calculate rotation angle based on Y position and time
// const rotationAngle = positionLocal.y.mul(twistAmount).add(time);

// // Calculate sin and cos of the angle
// const cosTheta = rotationAngle.cos();
// const sinTheta = rotationAngle.sin();

// // Construct Y-axis rotation matrix
// const rotationY = mat4(
//     cosTheta, 0, sinTheta, 0,
//     0, 1, 0, 0,
//     sinTheta.negate(), 0, cosTheta, 0,
//     0, 0, 0, 1
// );

// // Apply rotation to vertex position
// const originalPosition = positionLocal.toVec4(1.0);
// const twistedPosition = rotationY.mul(originalPosition).xyz;

// // Pass twisted position to fragment shader through varying
// const vTwistedPos = varying(twistedPosition);

// // Set position node to modified position
// material.positionNode = twistedPosition;

// // Create color effect based on twisted position
// material.colorNode = vTwistedPos
//     .normalize()         // Normalize position vector
//     .add(1.0)            // Shift range from [-1,1] to [0,2]
//     .mul(0.5)            // Scale to [0,1] range
//     .saturate();         // Clamp values between 0 and 1

