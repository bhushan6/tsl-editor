import { useCallback } from "react";
import { Node } from "../../nodl-core";
import { Vec3, Vec4, Vec2, Float, Int, Uint, Mat2, Mat3, Mat4, IVec2, IVec3, IVec4, UVec2, UVec3, UVec4, BVec2, BVec3, BVec4, Color } from "../../nodes/ConstantNodes";
import { MeshStandardMaterialNode } from "../../nodes/MaterialNodes";
import { MeshStandardMaterialWindow } from "./MeshStandardMaterialWindow";
import { VecWindow } from "./VecWindow";
import { FloatUniform, TextureUniform, Vec2Uniform, Vec3Uniform } from "../../nodes/UniformNodes";
import { UniformWinodw } from "./UniformWindow";
import { TextureUniformWindow } from "./TextureWindow";
import { ColorWindow } from "./ColorWindow";
import { UV } from "../../nodes/AttributeNodes";
import { UVWindow } from "./UVWindow";
import { isOperatorNode } from "../../nodes/MathNodes";
import { MathOperatorWindow } from "./MathOperatorsWindow";

export const useNodeWindowResolver = () => {
    return useCallback((node: Node) => {
      if (
        node instanceof Vec3 ||
        node instanceof Vec4 ||
        node instanceof Vec2 ||
        node instanceof Float ||
        node instanceof Int ||
        node instanceof Uint ||
        node instanceof Mat2 ||
        node instanceof Mat3 ||
        node instanceof Mat4 ||
        node instanceof IVec2 ||
        node instanceof IVec3 ||
        node instanceof IVec4 ||
        node instanceof UVec2 ||
        node instanceof UVec3 ||
        node instanceof UVec4 ||
        node instanceof BVec2 ||
        node instanceof BVec3 ||
        node instanceof BVec4
      ) {
        return <VecWindow node={node} />;
      } else if (node instanceof MeshStandardMaterialNode) {
        return <MeshStandardMaterialWindow node={node} />;
      }
      else if (
        node instanceof Vec2Uniform ||
        node instanceof Vec3Uniform ||
        node instanceof FloatUniform
      ) {
        return <UniformWinodw node={node} />;
      }
      else if (node instanceof TextureUniform) {
        return <TextureUniformWindow node={node} />;
      } else if (node instanceof Color) {
        return <ColorWindow node={node} />
      } else if (node instanceof UV) {
        return <UVWindow node={node} />
      } else if (isOperatorNode(node)) {
        return <MathOperatorWindow node={node} />
      } else {
        return <></>
      }
    }, []);
  };