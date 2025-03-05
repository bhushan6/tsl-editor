import { AttributeNodes } from "./AttributeNodes";
import { ConstantNodes } from "./ConstantNodes";
import { MaterialNodes } from "./MaterialNodes";
import { MathNodes } from "./MathNodes";
import { PositionNodes } from "./PositionNodes";
import { UniformNodes } from "./UniformNodes";
import { UtilityNodes } from "./UtilityNodes";
import { VaryingNode } from "./VaryingNode";
import { LogicNodes } from "./LogicNodes";

export const nodesPool = {
    ConstantNodes,
    MathNodes,
    AttributeNodes,
    UniformNodes,
    MaterialNodes,
    PositionNodes,
    UtilityNodes,
    VaryingNode,
    LogicNodes
};