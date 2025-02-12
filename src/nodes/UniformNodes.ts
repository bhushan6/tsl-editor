import { Output, schema, Node, Input } from "../nodl-core";
import { z } from "zod";
import { TextureLoader, Vector2, Vector3 } from "three";
import { uniform, time, texture, uv } from "three/tsl";
import { BehaviorSubject, combineLatest, map, of } from "rxjs";
import { createVarNameForNode } from "./utils";

export class Vec2Uniform extends Node {
  name = "Vec2Uniform";
  inputs = {};
  public _value = new Vector2();
  private _cachedNodeValue = uniform(this._value)
  outputs = {
    value: new Output({
      name: "Value",
      type: schema(z.any()),
      observable: of(() =>this._cachedNodeValue),
    }),
  };
  public code = () => {
    const varName = createVarNameForNode(this);
    return {
      code: `
      const ${varName}_uni = new THREE.Vector2(${this._value.x}, ${this._value.y});
      const ${varName} = uniform(${varName}_uni)`,
      dependencies: ["uniform"],
    };
  };
  public serialize() {
    const base = super.serialize();
    const value = this._value.toArray()
    base.internalValue = JSON.stringify(value)    
    return base;
  }
  public deserialize(data: string){
    try {
      const values = JSON.parse(data);
      if(!Array.isArray(values)) throw new Error(`Data should be serialized array for ${this.name} node`);
      this._value.fromArray(values)
    }catch(e){
      console.error(e);
    }
  }
}

export class Vec3Uniform extends Node {
  name = "Vec3Uniform";
  inputs = {};
  public _value = new Vector3();
  private _cachedNodeValue = uniform(this._value)
  outputs = {
    value: new Output({
      name: "Value",
      type: schema(z.any()),
      observable: of(() => this._cachedNodeValue),
    }),
  };
  public code = () => {
    const varName = createVarNameForNode(this);
    return {
      code: `
      const ${varName}_uni = new THREE.Vector3(${this._value.x}, ${this._value.y}, ${this._value.z});
      const ${varName} = uniform(${varName}_uni)`,
      dependencies: ["uniform"],
    };
  };
  public serialize() {
    const base = super.serialize();
    const value = this._value.toArray()
    base.internalValue = JSON.stringify(value)    
    return base;
  }
  public deserialize(data: string) {
    try {
      const values = JSON.parse(data);
      if(!Array.isArray(values)) throw new Error(`Data should be serialized array for ${this.name} node`);
      this._value.fromArray(values)
    } catch(e) {
      console.error(e);
    }
  }
}

export class FloatUniform extends Node {
  name = "FloatUniform";
  inputs = {};
  public _value = uniform(0);
  outputs = {
    value: new Output({
      name: "Value",
      type: schema(z.any()),
      observable: of(() => this._value),
    }),
  };
  public code = () => {
    const varName = createVarNameForNode(this);
   
    return {
      code: `const ${varName} = uniform(${this._value.value})`,
      dependencies: ["uniform"],
    };
  };
  public serialize() {
    const base = super.serialize();
    base.internalValue = JSON.stringify(this._value.value)    
    return base;
  }
  public deserialize(data: string) {
    try {
      const value = JSON.parse(data);
      if(typeof value !== 'number') throw new Error(`Data should be a number for ${this.name} node`);
      this._value.value = value;
    } catch(e) {
      console.error(e);
    }
  }
}

export class TimeUniform extends Node {
  name = "TimeUniform";
  inputs = {};
  outputs = {
    value: new Output({
      name: "Value",
      type: schema(z.any()),
      observable: of(() => time),
    }),
  };
  public code = () => {
    const varName = createVarNameForNode(this);
    return {
      code: `
      const ${varName} = time
      `,
      dependencies: ["time"],
    };
  };
}

const textureLoader = new TextureLoader();

export class TextureUniform extends Node {
  name = "TextureUniform";
  inputs = {
    uvs: new Input({
      name: "UVs",
      type: schema(z.any()),
      defaultValue: uv,
    }),
  };

  private _value = new BehaviorSubject<string>("/uv_grid.jpg");

  public value = this._value.asObservable();

  outputs = {
    value: new Output({
      name: "Value",
      type: schema(z.any()),

      observable: combineLatest([this._value, this.inputs.uvs]).pipe(
        map(
          (inputs) => () => texture(textureLoader.load(inputs[0]), inputs[1]())
        )
      ),
    }),
  };

  setTexture(texture: string) {
    this._value.next(texture);
  }

  public code = (args?: string[]) => {
    const argsString = args ? args.join(", ") : null;
    const varName = createVarNameForNode(this);
    return {
      code: `
      ${this.inputs.uvs.connected ? "" : `const ${varName}_uv = uv()`}
      const ${varName}_texture = textureLoader.load("${this._value.value}")
      const ${varName} = texture(${varName}_texture, ${
        !this.inputs.uvs.connected ? `${varName}_uv` : argsString
      })
      `,
      dependencies: ["texture", "uv"],
    };
  };
}

export const UniformNodes = {
  Vec2Uniform,
  Vec3Uniform,
  FloatUniform,
  TimeUniform,
  TextureUniform,
};
