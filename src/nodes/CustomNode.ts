import * as esprima from "esprima";
import { Input, Node, Output, schema } from "../nodl-core";
import { z } from "zod";
import { combineLatest, map, of } from "rxjs";
import * as TSL from "three/tsl";

export const createCustomNode = (tslCode: string, name?: string) => {
  const tslVm = new TSLVm(tslCode);

  const inputs = tslVm.ast.body[0]?.expression?.arguments[0]?.params?.[0]?.elements || [];
  const nodeInputs: Record<string, Input<any>> = {};

  inputs.forEach((input) => {
    nodeInputs[input.name] = new Input({
      name: input.name,
      type: schema(z.any()),
      defaultValue: () => 0,
    });
  });

    return class CustomNode extends Node {
      public name: string = "Custom Node";

      public localName: string | null =  name || null;

      public inputs: Record<string, Input<any>> = nodeInputs;

      outputs = {
        value: new Output({
          name: "Value",
          type: schema(z.any()),
          observable: Object.values(this.inputs).length > 0 ? combineLatest([...Object.values(this.inputs)]).pipe(
            map((inputs) => {
              return () => tslVm.run(inputs.map((i) => i()));
            }) 
          ) : of(tslVm.run),
        }),
      };

      public code(args: string[]): { code: string; dependencies: string[] } {
        return {
          code: "",
          dependencies: [],
        };
      }
    };
};


class TSLVm {
  private tslIdentifiers = Object.keys(TSL);
  private tslMethods = this.tslIdentifiers.map((identifier) => {
    //@ts-expect-error
    return TSL[identifier];
  });

  private userCodeStrict: string;

  public ast: any;

  constructor(tslCode: string) {
    const fnCode = this.extractFnCode(tslCode);
    if (!fnCode) throw new Error("Invalid TSL code");
    this.ast = this.validateFnCode(fnCode);
    this.userCodeStrict = `"use strict"; return ${fnCode}`;
  }

  private validateFnCode(input: string) {
    const ast = esprima.parseScript(input, { loc: true, range: true });
    console.log({ast});
    
    const validatedAST = this.validateAST(ast, new Set(this.tslIdentifiers));
    return validatedAST;
  }

  private validateAST(node, allowedMethods) {
    switch (node.type) {
      case "Program":
        node.body.forEach((statement) =>
          this.validateAST(statement, allowedMethods)
        );
        break;
      case "ExpressionStatement":
        this.validateAST(node.expression, allowedMethods);
        break;
      case "CallExpression":
        if (
          node.callee.type === "Identifier" &&
          !allowedMethods.has(node.callee.name)
        ) {
          throw new Error(`Disallowed function call: ${node.callee.name}`);
        }
        node.arguments.forEach((arg) => this.validateAST(arg, allowedMethods));
        break;
      case "Identifier":
        // Disallow access to known global objects
        if (["global", "window", "console"].includes(node.name)) {
          throw new Error(
            `Access to global object '${node.name}' is not allowed.`
          );
        }
        break;
      case "MemberExpression":
        this.validateAST(node.object, allowedMethods);
        this.validateAST(node.property, allowedMethods);
        break;
      case "FunctionExpression":
        node.params.forEach((param) => this.validateAST(param, allowedMethods));
        this.validateAST(node.body, allowedMethods);
        break;
      case "ReturnStatement":
        if (node.argument) {
          this.validateAST(node.argument, allowedMethods);
        }
        break;
      case "ForStatement":
      case "WhileStatement":
      case "DoWhileStatement":
      case "ForInStatement":
      case "ForOfStatement":
        throw new Error(`Loops are not allowed: ${node.type}`);
      default:
        Object.values(node).forEach((child) => {
          if (typeof child === "object" && child !== null) {
            this.validateAST(child, allowedMethods);
          }
        });
        break;
    }
    return node;
  }

  private extractFnCode(input: string) {
    // Match Fn( followed by any characters (non-greedy) until the matching closing parenthesis
    const fnPattern = /Fn\(\s*(\([^)]*\)\s*=>\s*{[\s\S]*?}\s*)\)/;
    const match = input.match(fnPattern);

    if (!match) {
      return null; // Return null if no match is found
    }

    // Return the full Fn(...) expression
    return `Fn(${match[1]})`;
  }

  public run = (args?: any[]) => {
    var userFunction = new Function(
      ...this.tslIdentifiers,
      this.userCodeStrict
    );
    return args
      ? userFunction(...this.tslMethods)(...args)
      : userFunction(...this.tslMethods)();
  }
}