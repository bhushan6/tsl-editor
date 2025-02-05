import { action, computed, makeObservable, observable } from "mobx";
import { v4 as uuid } from "uuid";

import { NodeData } from "./Node.types";
import { Connection } from "../Connection/Connection";
import { Input } from "../Input/Input";
import { Output } from "../Output/Output";
import { schema } from "../Schema/Schema";
import { z } from "zod";

type InputValueSerialized = {
  type: "PRIMITIVE" | "NODE" | "CONNECTED";
  value: string | number;
};
type InputSerialized = {
  [key: string]: { id: string; value: InputValueSerialized };
};
type OutputSerialized = { [key: string]: { id: string, value: string } };

export type NodeSerialized = {
  id: string;
  type: string;
  inputs: InputSerialized;
  outputs: OutputSerialized;
  position: { x: number; y: number };
};

export abstract class Node<TData extends NodeData = NodeData> {
  /** Identifier */
  public id: string = uuid();
  /** Node Name */
  static name: string = this.constructor.name;
  /** Node Inputs */
  public abstract inputs: Record<string, Input>;
  /** Node Outputs */
  public abstract outputs: Record<string, Output>;

  public localName: null | string = null;

  public abstract code(args: string[]): {
    code: string;
    dependencies: string[];
  };
  /** Arbitrary Data Store */
  public data: TData = {} as TData;

  constructor(
    id?: string,
    inputs?: InputSerialized,
    outputs?: OutputSerialized
  ) {
    if (id) this.id = id;
    if (inputs) {
      Object.entries(inputs).forEach(([key, value]) => {
        this.inputs[key].dispose();
        this.inputs[key] = new Input({
          name: this.inputs[key].name,
          defaultValue: this.inputs[key].defaultValue,
          id: value.id,
          type: schema(z.any())
        })
      });
    }
    if (outputs) {
      Object.entries(outputs).forEach(([key, value]) => {
        this.outputs[key].id = value.id;
      });
    }
    this.makeObservable();
  }

  public makeObservable = () => {
    makeObservable(this, {
      id: observable,
      data: observable,
      connections: computed,
      dispose: action,
    });
  };

  /** Associated connections */
  public get connections() {
    const res = [...Object.values(this.inputs), ...Object.values(this.outputs)]
      .flatMap((port) =>
        "connection" in port ? [port.connection] : port.connections
      )
      .filter((connection): connection is Connection<unknown> =>
        Boolean(connection)
      );

    return res;
  }

  /** Disposes the Node */
  public dispose(): void {
    for (const input of Object.values(this.inputs)) {
      input.dispose();
    }

    for (const output of Object.values(this.outputs)) {
      output.dispose();
    }
  }

  public serialize = (): NodeSerialized => {
    //@ts-expect-error
    console.log(this.name, ">>>>>>>>>>>>>");
    
    const inputs: InputSerialized = {};

    Object.entries(this.inputs).forEach(([key, input]) => {
      let type: InputValueSerialized["type"] = input.connection
        ? "CONNECTED"
        : "PRIMITIVE";
      let value = input.connection
        ? JSON.stringify({
          fromId: input.connection.from.id,
          fromName: input.connection?.from.name,
        })
        : input.getValue()();

        
      if (typeof value !== "string" && typeof value !== "number") {
        try {
          type = "NODE";
          value = JSON.stringify(value.toJSON());
        } catch (error) {
          console.error("ERROR WHILE SERIALIZING NODE", error);
        }
      }

      inputs[key] = {
        id: input.id,
        value: {
          type,
          value,
        },
      };
    });

    const outputs: OutputSerialized = {};

    const isCustomNode = this.constructor.name === "CustomNode";

    Object.entries(this.outputs).forEach(([key, output]) => {
      outputs[key] = {
        id: `${output.id}`,
        value: isCustomNode ? (this.getScript() || "") : JSON.stringify(output.name),
      };
    });

    return {
      //@ts-expect-error
      type: this.name,
      id: this.id,
      inputs,
      outputs,
      position: {
        x: 0,
        y: 0,
      }
    };
  };

  public getScript(){
    return null
  }

  static deserialize = (node: NodeSerialized) => {
    console.log(node);
  }
}
