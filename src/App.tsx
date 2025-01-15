import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import "./App.css";
import { Experience } from "./components/Experience";
import { Node } from "./nodl-core";
import { MaterialNodes, MeshStandardMaterialNode } from "./nodes/MaterialNodes";
import { Circuit, CircuitStore } from "./nodl-react";
import { Pane } from "tweakpane";
import {
  Float,
  Vec2,
  Vec3,
  Vec4,
  ConstantNodes,
  Int,
  Uint,
} from "./nodes/ConstantNodes";
import { toCartesianPoint } from "./nodl-react/utils/coordinates/coordinates";
import { Subscription } from "rxjs";
import { MathNodes } from "./nodes/MathNodes";
import { AttributeNodes } from "./nodes/AttributeNodes";
import {
  FloatUniform,
  TextureUniform,
  UniformNodes,
  Vec2Uniform,
  Vec3Uniform,
} from "./nodes/UniformNodes";
import { createVarNameForNode } from "./nodes/utils";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import "highlight.js/styles/atom-one-dark.css";
hljs.registerLanguage("javascript", javascript);

export let currentScale = 1;

const store = new CircuitStore();

const useNodeWindowResolver = () => {
  return useCallback((node: Node) => {
    if (
      node instanceof Vec3 ||
      node instanceof Vec4 ||
      node instanceof Vec2 ||
      node instanceof Float ||
      node instanceof Int ||
      node instanceof Uint
    ) {
      return <VecUI node={node} />;
    } else if (node instanceof MeshStandardMaterialNode) {
      return <MeshStandardMaterialUI node={node} />;
    } else if (
      node instanceof Vec2Uniform ||
      node instanceof Vec3Uniform ||
      node instanceof FloatUniform
    ) {
      return <UniformUI node={node} />;
    } else if (node instanceof TextureUniform) {
      return <TextureUniformUI node={node} />;
    }
  }, []);
};

const VecUI = ({ node }: { node: Vec3 | Vec4 | Vec2 | Float | Int | Uint }) => {
  const pane = useRef<Pane>();

  useEffect(() => {
    if (!ref.current) return;

    const inputPortKeys = Object.keys(node.inputs);

    const initValues = inputPortKeys.reduce((acc, key) => {
      acc[key] = node.inputs[key].value();
      return acc;
    }, {});

    pane.current = new Pane({ container: ref.current, expanded: true });

    const subs: Subscription[] = [];

    Object.keys(initValues).forEach((key) => {
      const binding = pane.current
        ?.addBinding(initValues, key)
        .on("change", (e) => {
          if (node.inputs[key]?.connected) return;
          node.inputs[key]?.next(() => e.value);
        });

      const sub = node.inputs[key].subscribe(() => {
        if (!node.inputs[key]?.connected) {
          binding!.disabled = false;
          return;
        }
        binding!.disabled = true;
        initValues[key] = 0;
        binding?.refresh();
      });
      subs.push(sub);
    });

    return () => {
      pane.current?.dispose();
      subs.forEach((sub) => sub.unsubscribe());
    };
  }, []);

  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      style={{
        color: "var(--text-neutral-color)",
        backgroundColor: "var(--node-background)",
        borderBottom: "2px solid var(--border-color)",
        padding: "14px 12px 12px",
      }}
    />
  );
};

const UniformUI = ({
  node,
}: {
  node: Vec2Uniform | Vec3Uniform | FloatUniform;
}) => {
  const pane = useRef<Pane>();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const initialInputs =
      node instanceof Vec2Uniform
        ? {
            x: 0,
            y: 0,
          }
        : node instanceof Vec3Uniform
        ? {
            x: 0,
            y: 0,
            z: 0,
          }
        : { x: 0 };

    pane.current = new Pane({ container: ref.current, expanded: true });

    Object.keys(initialInputs).forEach((key) => {
      const binding = pane.current
        ?.addBinding(initialInputs, key)
        .on("change", (e) => {
          if (node instanceof FloatUniform) {
            node._value.value = e.value || 0;
          } else {
            node._value[key] = e.value || 0;
          }
        });
    });

    return () => {
      pane.current?.dispose();
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        color: "var(--text-neutral-color)",
        backgroundColor: "var(--node-background)",
        borderBottom: "2px solid var(--border-color)",
        padding: "14px 12px 12px",
      }}
    />
  );
};

const TextureUniformUI = ({ node }: { node: TextureUniform }) => {
  const [texture, setTexture] = useState<string>("/uv_grid.jpg");

  useEffect(() => {
    const sub = node.value.subscribe((value) => {
      setTexture(value);
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      // ref={ref}
      style={{
        color: "var(--text-neutral-color)",
        backgroundColor: "var(--node-background)",
        borderBottom: "2px solid var(--border-color)",
        padding: "14px 12px 12px",
        // display: "flex",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          padding: "10px 16px",
          backgroundColor: "var(--node-background)",
          borderRadius: "12px",
          cursor: "pointer",
        }}
        onClick={() => {
          inputRef.current?.click();
        }}
      >
        Upload Image
      </div>
      <img
        style={{
          display: "flex",
          width: "100%",
        }}
        src={texture}
      ></img>
      <input
        ref={inputRef}
        type="file"
        style={{
          display: "none",
        }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const blobUrl = URL.createObjectURL(file);
          node.setTexture(blobUrl as string);
        }}
      />
    </div>
  );
};

type TreeNodeType = {
  node: Node;
  parents: TreeNodeType[];
};
type TreeType = {
  [key: string]: TreeNodeType;
};

const MeshStandardMaterialUI = ({
  node,
}: {
  node: MeshStandardMaterialNode;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const experienceRef = useRef<Experience | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const boundBox = canvasRef.current.getBoundingClientRect();

    experienceRef.current = new Experience(canvasRef.current, {
      width: boundBox.width * (1 / currentScale),
      height: boundBox.height * (1 / currentScale),
    });
  }, []);

  useEffect(() => {
    const sub3 = node.outputs.value.subscribe((value) => {
      experienceRef.current?.defaultBox(value);
    });

    return () => {
      sub3.unsubscribe();
    };
  }, []);

  const btnContainer = useRef<HTMLDivElement>(null);

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

      const pushNodeToTree = (currentNode: Node, parentNode: TreeNodeType) => {
        const currentInputs = Object.values(currentNode.inputs);

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

      pushNodeToTree(node, tree[node.id]);

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
      <div ref={btnContainer}></div>
    </>
  );
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

function App() {
  const nodeWindowResolver = useNodeWindowResolver();

  useLayoutEffect(() => {
    // store.setNodes([[new MeshStandardMaterialNode(), { x: 300, y: 0 }]]);

    return () => {
      store.dispose();
    };
  }, []);

  useEffect(() => {
    const nodeCanvas = document.getElementsByClassName("canvas")[0];

    if (!nodeCanvas) return;
    const nodeCanvasEle = nodeCanvas as HTMLDivElement;

    let currentTranslate = { x: 0, y: 0 };
    let panning = false;

    nodeCanvasEle.style.transformOrigin = "center";
    nodeCanvasEle.style.transform = `scale(${currentScale}) translate(${currentTranslate.x}px, ${currentTranslate.y}px)`;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const direction = Math.sign(e.deltaY);
      const zoom = 0.01;
      currentScale -= zoom * direction;
      currentScale = clamp(currentScale, 0.1, 5);
      nodeCanvasEle.style.transformOrigin = "center";
      nodeCanvasEle.style.transform = `scale(${currentScale}) translate(${currentTranslate.x}px, ${currentTranslate.y}px)`;
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
        panning = true;
        nodeCanvasEle.style.cursor = "grabbing";
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
        panning = false;
        nodeCanvasEle.style.cursor = "default";
      }
    };

    const onMouseLeave = (e: MouseEvent) => {
      if (e.button === 2) {
        panning = false;
        nodeCanvasEle.style.cursor = "default";
      }
    };

    const onBlur = () => {
      panning = false;
      nodeCanvasEle.style.cursor = "default";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (panning) {
        e.preventDefault();
        e.stopPropagation();
        const deltaX = e.movementX;
        const deltaY = e.movementY;
        currentTranslate.x += deltaX;
        currentTranslate.y += deltaY;
        nodeCanvasEle.style.transform = `scale(${currentScale}) translate(${currentTranslate.x}px, ${currentTranslate.y}px)`;
      }
    };

    nodeCanvasEle.addEventListener("wheel", onWheel);
    nodeCanvasEle.addEventListener("contextmenu", onContextMenu);
    nodeCanvasEle.addEventListener("mousedown", onMouseDown);

    nodeCanvasEle.addEventListener("mouseup", onMouseUp);
    nodeCanvasEle.addEventListener("mouseleave", onMouseLeave);

    nodeCanvasEle.addEventListener("blur", onBlur);

    nodeCanvasEle.addEventListener("mousemove", onMouseMove);

    return () => {
      nodeCanvasEle.removeEventListener("wheel", onWheel);
      nodeCanvasEle.removeEventListener("contextmenu", onContextMenu);
      nodeCanvasEle.removeEventListener("mousedown", onMouseDown);
      nodeCanvasEle.removeEventListener("mouseup", onMouseUp);
      nodeCanvasEle.removeEventListener("mouseleave", onMouseLeave);
      nodeCanvasEle.removeEventListener("blur", onBlur);
      nodeCanvasEle.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  const circuitContainer = useRef<HTMLDivElement>(null);

  const [containerBound, setContainerBound] = useState<DOMRect>();

  useEffect(() => {
    if (!circuitContainer.current) return;
    const container = circuitContainer.current;
    const rect = container.getBoundingClientRect();
    setContainerBound(rect);
  }, []);

  const pane = useRef<Pane>(null!);

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sidebarRef.current) return;

    pane.current = new Pane({
      container: sidebarRef.current,
      title: "Nodes",
      expanded: true,
    });

    const makeButtonsDraggable = (
      btn: HTMLElement,
      nodeName: string,
      nodeType: string
    ) => {
      btn.style.cursor = "grab !important";
      btn.draggable = true;
      btn.addEventListener("dragstart", (e) => {
        e.dataTransfer?.setData("text/plain", `${nodeName}-${nodeType}`);
      });
    };

    const materialNodesFolder = pane.current.addFolder({
      title: "Materials",
    });

    Object.keys(MaterialNodes).forEach((node) => {
      const btn = materialNodesFolder.addButton({
        title: node,
      });
      makeButtonsDraggable(btn.element, node, "MaterialNodes");
    });

    const constantNodesFolder = pane.current.addFolder({
      title: "Constants",
    });

    Object.keys(ConstantNodes).forEach((node) => {
      const btn = constantNodesFolder.addButton({
        title: node,
      });
      makeButtonsDraggable(btn.element, node, "ConstantNodes");
    });

    const mathNodesFolder = pane.current.addFolder({
      title: "Math",
    });

    Object.keys(MathNodes).forEach((node) => {
      const btn = mathNodesFolder.addButton({
        title: node,
      });
      makeButtonsDraggable(btn.element, node, "MathNodes");
    });

    const attributeNodesFolder = pane.current.addFolder({
      title: "Attributes",
    });

    Object.keys(AttributeNodes).forEach((node) => {
      const btn = attributeNodesFolder.addButton({
        title: node,
      });
      makeButtonsDraggable(btn.element, node, "AttributeNodes");
    });

    const uniformNodesFolder = pane.current.addFolder({
      title: "Uniforms",
    });

    Object.keys(UniformNodes).forEach((node) => {
      const btn = uniformNodesFolder.addButton({
        title: node,
      });
      makeButtonsDraggable(btn.element, node, "UniformNodes");
    });

    return () => {
      pane.current.dispose();
    };
  }, []);

  // const codeBlockRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (!codeBlockRef.current) return;
  //   codeBlockRef.current.childNodes.forEach((child) => {
  //     if (child instanceof HTMLElement) {
  //       hljs.highlightElement(child);
  //     }
  //   });
  //   // hljs.highlightElement(codeBlockRef.current);
  // }, [hljs]);

  // // const codeBlocks = [
  // //   `const {(texture, uniform, vec2, vec4, uv, oscSine, time, grayscale)} =
  // //   await import( 'three/tsl' );`,
  // //   `const samplerTexture = new
  // //   THREE.TextureLoader().load( './textures/uv_grid_opengl.jpg' );`,
  // //   `samplerTexture.wrapS = THREE.RepeatWrapping; samplerTexture.colorSpace =
  // //   THREE.SRGBColorSpace; `,
  // //   `const scaledTime = time.mul( .5 ); // .5 is speed`,
  // // ];

  return (
    <>
      <div
        style={{
          height: "100vh",
          width: "100vw",
          position: "relative",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <div
          style={{
            height: "100vh",
            minWidth: "250px",
            position: "absolute",
            zIndex: 1000,
            left: 0,
            top: 0,
            backgroundColor: "var(--panel-background)",
            color: "var(--text-light-color)",
            fontFamily: `"Inter", sans-serif;`,
            overflow: "auto",
          }}
          ref={sidebarRef}
          className="sidebar-container"
        />

        <div
          ref={circuitContainer}
          style={{
            height: "100vh",
            width: "100vw",
            position: "relative",
            display: "block",
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (!containerBound) return;

            const pools = {
              ConstantNodes,
              MathNodes,
              AttributeNodes,
              UniformNodes,
              MaterialNodes,
            };

            const [name, poolName] = e.dataTransfer
              .getData("text/plain")
              .split("-");

            const boundingRect = containerBound;

            const x = e.clientX - boundingRect.left;
            const y = e.clientY - boundingRect.top;
            const pool = pools[poolName];
            if (!pool) return;
            const node = pool[name];
            if (!node) return;
            const nodeInstance = new node();
            console.log(currentScale);

            store.setNodes([
              [
                nodeInstance,
                toCartesianPoint(boundingRect.width, boundingRect.height, x, y),
              ],
            ]);
          }}
          onDragOver={(e) => {
            e.preventDefault();
          }}
        >
          <Circuit
            className={"circuit"}
            store={store}
            nodeWindowResolver={nodeWindowResolver}
          />
        </div>
      </div>
    </>
  );
}

export default App;
