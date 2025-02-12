import { Output, schema, Node } from "../nodl-core";
import { z } from "zod";

import { uv, vertexColor } from "three/tsl";
import { BehaviorSubject, map, of } from "rxjs";
import { createVarNameForNode } from "./utils";

const UVSchema = schema(z.any());

export class UV extends Node {
  name = "UV";
  inputs = {};

  public _value= new BehaviorSubject(0);

  outputs = {
    value: new Output({
      name: "Value",
      type: UVSchema,
      observable: this._value.pipe(map(index => () => uv(index)))
    }),
  };

  public setValue (value: number) {
    this._value.next(value)
  }

  public code = () => {
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = uv()`,
      dependencies: ["uv"],
    };
  };
  
  public serialize() {
    const base = super.serialize();
    base.internalValue = JSON.stringify(this._value.value);    
    return base;
  }

  public deserialize(data: string) {
    try {
      const value = JSON.parse(data);
      if(typeof value !== 'number') throw new Error(`Data should be a number for ${this.name} node`);
      this._value.next(value);
    } catch(e) {
      console.error(e);
    }
  }
}

// console.log(uv(1).toJSON(), "uv", "JSONDATATEST");

//type: "VertexColorNode"
export class VertexColor extends Node {
  name = "VertexColor";
  inputs = {};
  outputs = {
    value: new Output({
      name: "Value",
      type: UVSchema,
      observable: of(vertexColor),
    }),
  };
  public code = () => {
    const varName = createVarNameForNode(this);
    return {
      code: `const ${varName} = vertexColor()`,
      dependencies: ["vertexColor"],
    };
  };
}
// console.log(vertexColor().toJSON(), "vertexColor", "JSONDATATEST");
export const AttributeNodes = {
  UV,
  VertexColor,
};
