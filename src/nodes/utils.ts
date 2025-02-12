// import {
//   uv,
//   vec4,
//   float,
//   int,
//   uint,
//   bool,
//   color,
//   Fn,
//   add,
//   mul,
//   sub,
//   div,
//   mod,
//   modInt,
//   equal,
//   lessThan,
//   greaterThan,
//   lessThanEqual,
//   greaterThanEqual,
//   abs,
//   vec2,
//   acos,
//   asin,
//   atan,
//   atan2,
//   clamp,
//   ceil,
//   cos,
//   cross,
//   degrees,
//   distance,
//   dot,
//   floor,
//   fract,
//   length,
//   log,
//   vec3,
//   uniform,
//   time,
//   texture,
// } from "three/tsl";
import { Node } from "../nodl-core";

export const createVarNameForNode = (node: Node) => {
  if (node.localName && node.localName.length > 0) {
    return node.localName;
  }
  const nodeId = node.id;
  const lastFourChars = nodeId.slice(-4).replace("-", "");
  return `node_${lastFourChars}`;
};

// Helper function to evaluate inputs
export const evaluateInputs = (inputs: any[], func: (...args: any[]) => any) => {
  return () => func(...inputs.map((i) => i()));
};
// const THREE_TSL = {
//   uv,
//   vec4,
//   float,
//   int,
//   uint,
//   bool,
//   color,
//   Fn,
//   add,
//   mul,
//   sub,
//   div,
//   mod,
//   modInt,
//   equal,
//   lessThan,
//   greaterThan,
//   lessThanEqual,
//   greaterThanEqual,
//   abs,
//   vec2,
//   acos,
//   asin,
//   atan,
//   atan2,
//   clamp,
//   ceil,
//   cos,
//   cross,
//   degrees,
//   distance,
//   dot,
//   floor,
//   fract,
//   length,
//   log,
//   vec3,
//   uniform,
//   time,
//   texture,
// };

// export const THREE_TSL_CONTEXT = Object.keys(THREE_TSL);

// export const evaluateGeneratedTSLCode = (code: string) => {
//   return function () {
//     return eval(code);
//   }.call(THREE_TSL_CONTEXT);
// };

// Define the event map interface
interface EventMap {
  [event: string]: any;
}

class EventEmitter<T extends EventMap> {
  private events: { [K in keyof T]?: Array<(data: T[K]) => void> } = {};

  public on<K extends keyof T>(event: K, callback: (data: T[K]) => void): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event]!.push(callback);
  }

  public off<K extends keyof T>(event: K, callback: (data: T[K]) => void): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event]!.filter(cb => cb !== callback);
  }

  // Overloaded emit method
  public emit<K extends keyof T>(event: K, data: T[K] extends void ? never : T[K]): void;
  public emit<K extends keyof T>(event: K): void;
  public emit<K extends keyof T>(event: K, data?: T[K]): void {
    if (!this.events[event]) return;
    this.events[event]!.forEach(callback => callback(data as T[K]));
  }

  public removeAllListeners(event?: keyof T): void {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

export type SAVE_STATE_TYPE ="UNSAVED CHANGES" | "SAVING" | "SAVED"

// Example usage:
interface EditorEvents {
  // nodeSelected: { nodeId: string; position: { x: number; y: number } };
  // nodeDeleted: { nodeId: string };
  // connectionCreated: { sourceId: string; targetId: string };
  // Add more event types as needed
  changed: void;
  saveStateChanged : {state: SAVE_STATE_TYPE}
}

export const EditorEventEmitter = new EventEmitter<EditorEvents>();