import { useContext, useEffect, useRef } from "react";
import { MeshStandardMaterialNode } from "../../nodes/MaterialNodes";
import { Experience } from "../Experience";
import { StoreContext } from "../../nodl-react";
import { createVarNameForNode, EditorEventEmitter } from "../../nodes/utils";
import { Fn } from "three/tsl";
import { Pane } from "tweakpane";
import { Input } from "../../nodl-core";

type TreeNodeType = {
  node: Node;
  parents: TreeNodeType[];
};
type TreeType = {
  [key: string]: TreeNodeType;
};

export const MeshStandardMaterialWindow = ({
  node,
}: {
  node: MeshStandardMaterialNode;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { store } = useContext(StoreContext)
  const experienceRef = useRef<Experience | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const boundBox = canvasRef.current.getBoundingClientRect();

    experienceRef.current = new Experience(canvasRef.current, {
      width: boundBox.width * (1 / store._editorTransformation.scale),
      height: boundBox.height * (1 / store._editorTransformation.scale),
    }, uiContainer.current || undefined);

    const sizeObserver = new ResizeObserver(() => {
      EditorEventEmitter.emit("updateConnectionUI", { connections: node.connections })
    })

    if (uiContainer.current) {
      sizeObserver.observe(uiContainer.current)
    }


    const subs = EditorEventEmitter.on("selectionChanged", ({ nodes }) => {
      if (nodes?.includes(node)) {
        experienceRef.current?.startRendering()
      } else {
        experienceRef.current?.stopRendering()
      }
    })

    const forceRenderSubs = EditorEventEmitter.on("forceRender", () => {
      experienceRef.current?.render()
    })

    return () => {
      subs();
      forceRenderSubs()
      experienceRef.current?.dispose();
      sizeObserver.disconnect()
    }
  }, []);

  useEffect(() => {
    const colorNodeSubs = node.inputs.colorNode?.subscribe((value) => {
      const colorNode = Fn(value)
      experienceRef.current?.updateNode("colorNode", colorNode);
    });

    const positionNodeSubs = node.inputs.positionNode?.subscribe((value) => {
      const positionNode = Fn(value)
      experienceRef.current?.updateNode("positionNode", positionNode);
    });

    return () => {
      colorNodeSubs.unsubscribe();
      positionNodeSubs.unsubscribe();
    };
  }, []);

  const btnContainer = useRef<HTMLDivElement>(null);
  const uiContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!btnContainer.current) return;
    const pane = new Pane({ container: btnContainer.current, expanded: true });
    const btn = pane.addButton({
      title: `Copy Code`,
    });

    let timeoutId: number;

    btn.on("click", () => {
      timeoutId && clearTimeout(timeoutId);
      btn.title = "Copying...";
      const nodesMap = new Map<string, Node>();

      const outputToNodeMap = new Map<string, Node>();
      const inputToNodeMap = new Map<string, Node>();

      const nodes = store.nodes;

      nodes.forEach((node) => {
        nodesMap.set(node.id, node);
        Object.values(node.outputs).forEach((output) => {
          outputToNodeMap.set(output.id, node);
        });
        Object.values(node.inputs).forEach((input) => {
          inputToNodeMap.set(input.id, node);
        });
      });

      const tree: TreeType = {
        [node.id]: {
          node,
          parents: [],
        },
      };

      const pushNodeToTree = (currentNode: Node, parentNode: TreeNodeType, traceInput?: string) => {
        const currentInputs: Input[] = traceInput ? Object.keys(currentNode.inputs).filter(inputName => inputName === traceInput).map(name => currentNode.inputs[name]).filter(input => input !== null || input !== undefined) : Object.values(currentNode.inputs);

        currentInputs.map((currentInput) => {
          const connection = currentInput.connection;

          if (!connection) return;

          const output = connection.from;
          const node = outputToNodeMap.get(output.id);
          if (!node) return;
          const leaf = {
            node,
            parents: [],
          };
          parentNode.parents = [...parentNode.parents, leaf];

          pushNodeToTree(node, leaf);
        });
      };

      pushNodeToTree(node, tree[node.id], "colorNode");

      const traverseTree = (
        rootNode: TreeNodeType,
        cb: (child: TreeNodeType) => void
      ) => {
        cb(rootNode);
        rootNode.parents.forEach((node) => {
          traverseTree(node, cb);
        });
      };

      const generatedCode: string[] = [];
      const imports = new Set<string>();

      traverseTree(tree[node.id], (child) => {
        const node = child.node;

        const inputs = Object.values(child.node.inputs);
        const t = ["X", "Y", "Z", "W"];

        let args: string[] = [];
        for (let index = 0; index < inputs.length; index++) {
          const input = inputs[index];
          if (input.connection) {
            const id = input.connection.from.id;
            const node = outputToNodeMap.get(id);
            if (node) {
              const isSplitNode = node.name.includes("Split");
              const varName = createVarNameForNode(node);
              if (isSplitNode) {
                if (!t[index]) throw new Error("not implemented");
                args.push(`${varName}_${t[index]}`);
              } else {
                args.push(varName);
              }
            }
          }
        }
        const code = node.code && node.code(args);
        generatedCode.unshift(code.code.trim());
        code.dependencies.forEach((importName) => {
          imports.add(importName);
        });
      });

      const importsString = Array.from(imports).join(", ");
      const importStatement = `import { ${importsString}, Fn } from "three/tsl";`;
      //remove duplicates
      const uniqueStatements = [...new Set(generatedCode)].join("\n");
      // const codeBlock = generatedCode.join("\n");
      const fnString = `Fn(() => {
          ${uniqueStatements}
        })()`;

      const code = `${importStatement}\n${fnString}`;

      navigator.clipboard.writeText(code);
      btn.title = "Copied to Clipboard";
      timeoutId = setTimeout(() => {
        btn.title = "Copy Code";
      }, 1000);
    });
    return () => {
      timeoutId && clearTimeout(timeoutId);
      pane.dispose();
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "300px",
          backgroundColor: "var(--node-background)",
        }}
      />
      <div ref={uiContainer} />
      <div ref={btnContainer} />
    </>
  );
};