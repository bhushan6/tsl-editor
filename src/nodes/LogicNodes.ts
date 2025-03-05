import { Input, Output, schema, Node } from "../nodl-core";
import { z } from "zod";
import { combineLatest, map } from "rxjs";
import { createVarNameForNode } from "./utils";
import { equal, greaterThan, lessThan, greaterThanEqual, lessThanEqual, and, or, not, select, If as tslIf } from "three/tsl";

/**
 * Base class for all logic comparison nodes
 */
abstract class ComparisonNode extends Node {
  public inputs = {
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
  };

  public abstract operation: Function;
  
  public outputs = {
    result: new Output({
      name: "Result",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.a, this.inputs.b]).pipe(
        map((inputs) => {
          return () => this.operation(inputs[0](), inputs[1]());
        })
      ),
    }),
  };

  public code = (args: string[]) => {
    let index = 0;
    const a = this.inputs.a.connected ? args[index++] : this.inputs.a.getValue()();
    const b = this.inputs.b.connected ? args[index++] : this.inputs.b.getValue()();
    const varName = createVarNameForNode(this);
    
    return {
      code: `const ${varName} = ${this.operation.name}(${a}, ${b})`,
      dependencies: [this.operation.name],
    };
  };
}

export class Equal extends ComparisonNode {
  name = "Equal";
  operation = equal;
}

export class NotEqual extends Node {
  name = "NotEqual";
  
  public inputs = {
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
  };
  
  public outputs = {
    result: new Output({
      name: "Result",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.a, this.inputs.b]).pipe(
        map((inputs) => {
          return () => not(equal(inputs[0](), inputs[1]()));
        })
      ),
    }),
  };

  public code = (args: string[]) => {
    let index = 0;
    const a = this.inputs.a.connected ? args[index++] : this.inputs.a.getValue()();
    const b = this.inputs.b.connected ? args[index++] : this.inputs.b.getValue()();
    const varName = createVarNameForNode(this);
    
    return {
      code: `const ${varName} = not(equal(${a}, ${b}))`,
      dependencies: ["not", "equal"],
    };
  };
}

export class GreaterThan extends ComparisonNode {
  name = "GreaterThan";
  operation = greaterThan;
}

export class LessThan extends ComparisonNode {
  name = "LessThan";
  operation = lessThan;
}

export class GreaterThanEqual extends ComparisonNode {
  name = "GreaterThanEqual";
  operation = greaterThanEqual;
}

export class LessThanEqual extends ComparisonNode {
  name = "LessThanEqual";
  operation = lessThanEqual;
}

export class And extends ComparisonNode {
  name = "And";
  operation = and;
}

export class Or extends ComparisonNode {
  name = "Or";
  operation = or;
}

export class Not extends Node {
  name = "Not";
  
  public inputs = {
    a: new Input({
      name: "A",
      type: schema(z.any()),
      defaultValue: () => true,
    }),
  };
  
  public outputs = {
    result: new Output({
      name: "Result",
      type: schema(z.any()),
      observable: combineLatest([this.inputs.a]).pipe(
        map((inputs) => {
          return () => not(inputs[0]());
        })
      ),
    }),
  };

  public code = (args: string[]) => {
    const a = this.inputs.a.connected ? args[0] : this.inputs.a.getValue()();
    const varName = createVarNameForNode(this);
    
    return {
      code: `const ${varName} = not(${a})`,
      dependencies: ["not"],
    };
  };
}

export class Conditional extends Node {
  name = "Conditional";
  
  public inputs = {
    condition: new Input({
      name: "Condition",
      type: schema(z.any()),
      defaultValue: () => true,
    }),
    then: new Input({
      name: "Then",
      type: schema(z.any()),
      defaultValue: () => 1,
    }),
    else: new Input({
      name: "Else",
      type: schema(z.any()),
      defaultValue: () => 0,
    }),
  };
  
  public outputs = {
    result: new Output({
      name: "Result",
      type: schema(z.any()),
      observable: combineLatest([
        this.inputs.condition, 
        this.inputs.then, 
        this.inputs.else
      ]).pipe(
        map((inputs) => {
          return () => select(inputs[0](), inputs[1](), inputs[2]());
        })
      ),
    }),
  };

  public code = (args: string[]) => {
    let index = 0;
    const condition = this.inputs.condition.connected ? args[index++] : this.inputs.condition.getValue()();
    const thenValue = this.inputs.then.connected ? args[index++] : this.inputs.then.getValue()();
    const elseValue = this.inputs.else.connected ? args[index++] : this.inputs.else.getValue()();
    const varName = createVarNameForNode(this);
    
    return {
      code: `const ${varName} = select(${condition}, ${thenValue}, ${elseValue})`,
      dependencies: ["select"],
    };
  };
}

/**
 * Collection of all logic nodes
 */
export const LogicNodes = {
  Equal,
  NotEqual,
  GreaterThan,
  LessThan,
  GreaterThanEqual,
  LessThanEqual,
  And,
  Or,
  Not,
  Conditional
};
