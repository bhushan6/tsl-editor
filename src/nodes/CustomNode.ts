import * as esprima from "esprima";
import { Input, Node, Output, schema } from "../nodl-core";
import { z } from "zod";
import { combineLatest, map } from "rxjs";
import * as TSL from "three/tsl";

const tslIdentifiers = Object.keys(TSL);
const tslMethods = tslIdentifiers.map((identifier) => {
  //@ts-expect-error
  return TSL[identifier];
});

// console.log(tslIdentifiers);
// console.log(tslMethods);

export const createCustomNode = (tslCode: string, name?: string) => {
  const tslVm = new TSLVm(tslCode);

  console.log(tslVm.ast.body[0].expression.arguments[0].params[0].elements);
  const inputs = tslVm.ast.body[0].expression.arguments[0].params[0].elements;
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
          observable: combineLatest([...Object.values(this.inputs)]).pipe(
            map((inputs) => {
              return () => tslVm.run(inputs.map((i) => i()));
            })
          ),
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

// createCustomNode("Fn(() => vec2(0, 1))")

const t1 = `Fn( ( [ uv, multiplier, rotation, offset ] ) => {

					const centeredUv = uv.sub( 0.5 ).toVar();
					const distanceToCenter = centeredUv.length();
					const angle = atan( centeredUv.y, centeredUv.x );
					const radialUv = vec2( angle.add( PI ).div( PI2 ), distanceToCenter ).toVar();
					radialUv.mulAssign( multiplier );
					radialUv.x.addAssign( rotation );
					radialUv.y.addAssign( offset );
					return radialUv;

				} );
                `;

const t2 = `
wtf
asd,mna
Fn(( [ uv, skew ] ) => {

					return vec2(
						uv.x.add( uv.y.mul( skew.x ) ),
						uv.y.add( uv.x.mul( skew.y ) )
					);

				})();
                asda
`;

// var userCodeStrict = '"use strict"; return ' + t1;
// var userFunction = new Function(...tslIdentifiers, userCodeStrict);
// console.log(userFunction(...tslMethods)(TSL.uv(), 1, 0, 0))

// function extractFnCode(input: string) {
//     // Match Fn( followed by any characters (non-greedy) until the matching closing parenthesis
//     const fnPattern = /Fn\(\s*(\([^)]*\)\s*=>\s*{[\s\S]*?}\s*)\)/;
//     const match = input.match(fnPattern);

//     if (!match) {
//         return null; // Return null if no match is found
//     }

//     // Return the full Fn(...) expression
//     return `Fn(${match[1]})`;
// }

class TSLVm {
  private tslIdentifiers = Object.keys(TSL);
  private tslMethods = tslIdentifiers.map((identifier) => {
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
    const validatedAST = this.validateAST(ast, new Set(this.tslIdentifiers));
    return validatedAST;
  }

  private validateAST(node, allowedMethods) {
    switch (node.type) {
      case "Program":
        console.log({ Program: node });
        node.body.forEach((statement) =>
          this.validateAST(statement, allowedMethods)
        );
        break;
      case "ExpressionStatement":
        console.log({ ExpressionStatement: node });
        this.validateAST(node.expression, allowedMethods);
        break;
      case "CallExpression":
        console.log({ CallExpression: node.callee, args: node.arguments });
        if (
          node.callee.type === "Identifier" &&
          !allowedMethods.has(node.callee.name)
        ) {
          throw new Error(`Disallowed function call: ${node.callee.name}`);
        }
        // if (node.callee.type === 'MemberExpression') {
        //   const methodName = node.callee.property.name;
        //   console.log({methodName}, ">>>>>>>>>>>>>>>>>>>>>>>>>");

        // //   if (!allowedMethods.has(methodName)) {
        // //     throw new Error(`Disallowed method call: ${methodName}`);
        // //   }
        // }
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
        console.log({
          FunctionExpression: node,
          args: node.params,
          body: node.body,
        });
        node.params.forEach((param) => this.validateAST(param, allowedMethods));
        this.validateAST(node.body, allowedMethods);
        break;
      case "ReturnStatement":
        if (node.argument) {
          console.log({ ReturnStatement: node, argument: node.argument });
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

  public run(args?: any[]) {
    var userFunction = new Function(
      ...this.tslIdentifiers,
      this.userCodeStrict
    );
    return args
      ? userFunction(...this.tslMethods)(...args)
      : userFunction(...this.tslMethods)();
  }
}

// const tslVm = new TSLVm(t1);
