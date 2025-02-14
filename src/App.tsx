import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Experience } from "./components/Experience";
import { Input, Node } from "./nodl-core";
import "./App.css";
import { MaterialNodes, MeshStandardMaterialNode } from "./nodes/MaterialNodes";
import { Circuit, CircuitStore } from "./nodl-react";
import { ButtonApi, Pane } from "tweakpane";
import {
  Float,
  Vec2,
  Vec3,
  Vec4,
  ConstantNodes,
  Int,
  Uint,
  Color,
  Mat2,
  Mat3,
  Mat4,
  IVec2,
  IVec3,
  IVec4,
  UVec2,
  UVec3,
  UVec4,
  BVec2,
  BVec3,
  BVec4,
} from "./nodes/ConstantNodes";
import { PositionNodes } from "./nodes/PositionNodes";
import { toCartesianPoint } from "./nodl-react/utils/coordinates/coordinates";
import { Subscription } from "rxjs";
import {  isOperatorNode, MathNodes } from "./nodes/MathNodes";
import { AttributeNodes, UV } from "./nodes/AttributeNodes";
import {
  FloatUniform,
  TextureUniform,
  UniformNodes,
  Vec2Uniform,
  Vec3Uniform,
} from "./nodes/UniformNodes";
import { createVarNameForNode, EditorEventEmitter, SAVE_STATE_TYPE } from "./nodes/utils";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import "highlight.js/styles/atom-one-dark.css";
import { createCustomNode } from "./nodes/CustomNode";
import { Fn } from "three/tsl";
import { UtilityNodes } from "./nodes/UtilityNodes";
import { VaryingNode } from "./nodes/VaryingNode";
hljs.registerLanguage("javascript", javascript);

const CustomNodes: { [key: string]: Node } = {

};

const pools = {
  ConstantNodes,
  MathNodes,
  AttributeNodes,
  UniformNodes,
  MaterialNodes,
  CustomNodes,
  PositionNodes,
  UtilityNodes,
  VaryingNode
};

export const getNodeByName = (name: string) => {
  const poolsValues = Object.values(pools)
  for (let index = 0; index < poolsValues.length; index++) {
    const pool = poolsValues[index];
    const poolKeys = Object.keys(pool);
    for (let index = 0; index < poolKeys.length; index++) {
      const elementName = poolKeys[index];
      const element = pool[elementName];
      if (elementName === name) {
        return element;
      }
    }
  }
  return null;
}

export let currentScale = 1;
export let currentTranslate = { x: 0, y: 0 };

const store = new CircuitStore();

const useNodeWindowResolver = () => {
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
      return <VecUI node={node} />;
    } else if (node instanceof MeshStandardMaterialNode) {
      return <MeshStandardMaterialUI node={node} />;
    }
    else if (
      node instanceof Vec2Uniform ||
      node instanceof Vec3Uniform ||
      node instanceof FloatUniform
    ) {
      return <UniformUI node={node} />;
    }
    else if (node instanceof TextureUniform) {
      return <TextureUniformUI node={node} />;
    } else if (node instanceof Color) {
      return <ColorUI node={node} />
    } else if (node instanceof UV) {
      return <UVUI node={node} />
    } else if (isOperatorNode(node)) {
      return <MathOperatorUI node={node} />
    } else {
      return null
    }
  }, []);
};

const ColorUI = ({ node }: { node: Color }) => {
  const pane = useRef<Pane>();
  const ref = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (!ref.current) return;

    pane.current = new Pane({ container: ref.current, expanded: true });
    const PARAMS = {
      key: '#000000',
    };

    const bind = pane.current.addBinding(PARAMS, 'key', {
      picker: 'inline',
      expanded: true,
      label: "",
    });


    let t: number
    bind.on("change", (e) => {
      clearTimeout(t)
      t = setTimeout(() => {
        node.setValue(e.value)
      }, 300)
    })

    const subs = node._value.subscribe((hexColor) => {


      if (PARAMS.key !== hexColor) {
        PARAMS.key = hexColor
        pane.current?.refresh();
      }

    })



    return () => {
      subs.unsubscribe();
      clearTimeout(t)
      pane.current?.dispose();
    };
  }, []);

  return <div
    ref={ref}
    style={{
      color: "var(--text-neutral-color)",
      backgroundColor: "var(--node-background)",
      borderBottom: "2px solid var(--border-color)",
      padding: "14px 12px 12px",
    }}
  />
}

const UVUI = ({ node }: { node: UV }) => {
  const pane = useRef<Pane>();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    pane.current = new Pane({ container: ref.current, expanded: true });
    const PARAMS = {
      UVIndex: "0",
    };

    const bind = pane.current.addBinding(PARAMS, 'UVIndex', {
      expanded: true,
      options: {
        0: "0",
        1: "1",
        2: "2",
        3: "3",
        4: "4",
        5: "5",
        6: "6",
        7: "7"
      }
    });


    bind.on("change", (e) => {
      node.setValue(Number(e.value))
    })

    const subs = node._value.subscribe((index) => {
      const value = String(index)

      if (PARAMS.UVIndex !== value) {
        PARAMS.UVIndex = value
        pane.current?.refresh();
      }

    })

    return () => {
      subs.unsubscribe();
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
}

const MathOperatorUI = ({ node }) => {
  const pane = useRef<Pane>();

  useEffect(() => {
    if (!ref.current) return;

    const inputPortKeys = Object.keys(node.inputs) as (keyof typeof node.inputs)[];

    const initValues = inputPortKeys.reduce((acc, key) => {
      const value = node.inputs[key].value()
      if (isNaN(value)) {
        acc[key] = { x: 0, y: 0, z: 0 };
      } else {
        acc[key] = { x: value, y: 0, z: 0 };
      }
      return acc;
    }, {} as Record<keyof typeof node.inputs, { x: number, y: number, z: number }>);

    pane.current = new Pane({ container: ref.current, expanded: true });

    const subs: Subscription[] = [];

    const createSliders = (initialValue: { x: number, y: number, z: number }) => {
      const xSlider = pane.current!.addBinding(initialValue, "x")
      const ySlider = pane.current!.addBinding(initialValue, "y")
      const zSlider = pane.current!.addBinding(initialValue, "z")
      return { xSlider, ySlider, zSlider }
    }

    const enableUI = (uiEle: { binding: any, sliders: { xSlider: any, ySlider: any, zSlider: any } }, enable: boolean) => {
      const { binding, sliders } = uiEle
      binding!.disabled = enable;
      sliders.xSlider.disabled = enable
      sliders.ySlider.disabled = enable
      sliders.zSlider.disabled = enable
    }

    inputPortKeys.forEach((key) => {
      const binding = pane.current!.addBlade({
        view: 'list',
        label: key,
        options: [
          { text: 'FLOAT', value: 'FLOAT' },
          { text: 'VEC2', value: 'VEC2' },
          { text: 'VEC3', value: 'VEC3' },
        ],
        value: 'FLOAT',
      }).on("change", (e) => {
        if (e.value === "FLOAT") {
          sliders.xSlider.hidden = false
          sliders.ySlider.hidden = true
          sliders.zSlider.hidden = true
        } else if (e.value === "VEC2") {
          sliders.xSlider.hidden = false
          sliders.ySlider.hidden = false
          sliders.zSlider.hidden = true
        } else if (e.value === "VEC3") {
          sliders.xSlider.hidden = false
          sliders.ySlider.hidden = false
          sliders.zSlider.hidden = false
        }
        node.setValue(key, { value: { x: initValues[key].x, y: initValues[key].y, z: initValues[key].z }, type: e.value })
      })
      const sliders = createSliders(initValues[key])

      sliders.xSlider.on("change", (e) => {
        node.setValue(key, { value: { x: e.value, y: initValues[key].y, z: initValues[key].z }, type: binding.value })
      })

      sliders.ySlider.on("change", (e) => {
        node.setValue(key, { value: { x: initValues[key].x, y: e.value, z: initValues[key].z }, type: binding.value })
      })

      sliders.zSlider.on("change", (e) => {

        node.setValue(key, { value: { x: initValues[key].x, y: initValues[key].y, z: e.value }, type: binding.value })
      })

      sliders.xSlider.hidden = false
      sliders.ySlider.hidden = true
      sliders.zSlider.hidden = true


      const sub = node.inputs[key].subscribe(() => {

        if (!node.inputs[key]?.connected) {
          const currentValue = node.inputs[key].getValue()()
          if (isNaN(currentValue)) {
            if (currentValue.nodeType === "vec2") {
              initValues[key].x = currentValue.value.x
              initValues[key].y = currentValue.value.y
              binding.value = "VEC2"
            } else if (currentValue.nodeType === "vec3") {
              initValues[key].x = currentValue.value.x
              initValues[key].y = currentValue.value.y
              initValues[key].z = currentValue.value.z
              binding.value = "VEC3"
            }
          } else {
            initValues[key].x = currentValue
            binding.value = "FLOAT"
          }
          // binding.refresh()
          sliders.xSlider.refresh();
          sliders.ySlider.refresh();
          sliders.zSlider.refresh();
          enableUI({ binding, sliders }, false)
          return;
        }
        enableUI({ binding, sliders }, true)
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

const VecUI = ({ node }: { node: Vec3 | Vec4 | Vec2 | Float | Int | Uint | Mat2 | Mat3 | Mat4 | IVec2 | IVec3 | IVec4 | UVec2 | UVec3 | UVec4 | BVec2 | BVec3 | BVec4 }) => {
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
          x: node._value.x,
          y: node._value.y,
        }
        : node instanceof Vec3Uniform
          ? {
            x: node._value.x,
            y: node._value.y,
            z: node._value.z
          }
          : { x: node._value.value };

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

    const subs = EditorEventEmitter.on("selectionChanged", ({ nodes }) => {
      if (nodes?.includes(node)) {
        experienceRef.current?.startRendering()
      } else {
        experienceRef.current?.stopRendering()
      }
    })

    return () => subs();
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
      <div ref={btnContainer}></div>
    </>
  );
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

function App() {
  const nodeWindowResolver = useNodeWindowResolver();
  const [saveState, setSaveState] = useState<SAVE_STATE_TYPE>("SAVED");
  useLayoutEffect(() => {


    EditorEventEmitter.on("changed", () => {
      store.save()
    })

    EditorEventEmitter.on("saveStateChanged", (data) => {
      setSaveState(data.state)
    })

    store.loadFromJson();

    // const t = setInterval(() => {
    //   nodes.forEach(([node], i) => {
    //     let toggleVisibility = node.visible ? store.hideNode : store.unHideNode

    //     if(node.name !== "MeshStandardMaterialNode" && i % 2 === 0){
    //       node.visible ? store.hideNode(node.id) : store.unHideNode(node.id)
    //     }
    //   })
    // }, 3000)

    return () => {
      EditorEventEmitter.removeAllListeners("changed");
      EditorEventEmitter.removeAllListeners("saveStateChanged");
      store.dispose();
    };
  }, []);

  useEffect(() => {
    const nodeCanvas = document.getElementsByClassName("canvas")[0];

    if (!nodeCanvas) return;
    const nodeCanvasEle = nodeCanvas as HTMLDivElement;
    const settings = localStorage.getItem("editor-settings")
    if (settings) {
      const parsedSettings = JSON.parse(settings)
      currentScale = parsedSettings.currentScale
      currentTranslate = parsedSettings.currentTranslate
    }

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

    const searchState = { query: '' };

    // Add search input using Tweakpane
    const searchInput = pane.current.addBinding(searchState, 'query', {
      label: 'Search Node',
    });

    // Create a map to store all buttons for easy filtering
    const nodeButtons = new Map<string, ButtonApi>();

    searchInput.on('change', (ev) => {
      const searchTerm = ev.value.toLowerCase();
      nodeButtons.forEach((btnContainer, fullName) => {
        if (btnContainer) {
          const shouldShow = fullName.toLowerCase().includes(searchTerm);
          btnContainer.hidden = !shouldShow
          pane.current.refresh()
        }
      });
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
      nodeButtons.set(node, btn)
    });

    const constantNodesFolder = pane.current.addFolder({
      title: "Constants",
    });

    Object.keys(ConstantNodes).forEach((node) => {
      const btn = constantNodesFolder.addButton({
        title: node,
      });
      makeButtonsDraggable(btn.element, node, "ConstantNodes");
      nodeButtons.set(node, btn)
    });

    const mathNodesFolder = pane.current.addFolder({
      title: "Math",
    });

    Object.keys(MathNodes).forEach((node) => {
      const btn = mathNodesFolder.addButton({
        title: node,
      });
      makeButtonsDraggable(btn.element, node, "MathNodes");
      nodeButtons.set(node, btn)
    });

    const attributeNodesFolder = pane.current.addFolder({
      title: "Attributes",
    });

    Object.keys(AttributeNodes).forEach((node) => {
      const btn = attributeNodesFolder.addButton({
        title: node,
      });
      makeButtonsDraggable(btn.element, node, "AttributeNodes");
      nodeButtons.set(node, btn)
    });

    const positionNodesFolder = pane.current.addFolder({
      title: "Position",
    });

    Object.keys(PositionNodes).forEach((node) => {
      const btn = positionNodesFolder.addButton({
        title: node,
      });
      makeButtonsDraggable(btn.element, node, "PositionNodes");
      nodeButtons.set(node, btn)
    });

    const uniformNodesFolder = pane.current.addFolder({
      title: "Uniforms",
    });

    Object.keys(UniformNodes).forEach((node) => {
      const btn = uniformNodesFolder.addButton({
        title: node,
      });
      makeButtonsDraggable(btn.element, node, "UniformNodes");
      nodeButtons.set(node, btn)
    });

    const varyingNodesFolder = pane.current.addFolder({
      title: "Varying",
    });
    Object.keys(VaryingNode).forEach((node) => {
      const btn = varyingNodesFolder.addButton({
        title: node,
      });
      makeButtonsDraggable(btn.element, node, "VaryingNode");
      nodeButtons.set(node, btn)
    });

    const CustomNodesFolder = pane.current.addFolder({
      title: "Custom",
    });

    const btn = CustomNodesFolder.addButton({
      title: "Create Custom Node",
    });

    const UtilityNodesFolder = pane.current.addFolder({
      title: "Utility",
    });

    Object.keys(UtilityNodes).forEach((node) => {
      const btn = UtilityNodesFolder.addButton({
        title: node,
      });
      makeButtonsDraggable(btn.element, node, "UtilityNodes");
      nodeButtons.set(node, btn)
    });

    btn.on("click", () => {
      setCustomNodeForm(p => !p)
    })



    return () => {
      pane.current.dispose();
    };
  }, []);


  const [customNodeForm, setCustomNodeForm] = useState(false)

  const nameInputRef = useRef<HTMLInputElement>(null);
  const nodeCodeInputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <>
      {customNodeForm && (
        <div className="popup-overlay">
          <div className="popup-container">
            <div className="popup-header">
              <h2 className="popup-title">Add Node</h2>
            </div>
            <div className="form-group">
              <label htmlFor="nodeName" className="form-label">
                Node Name:
              </label>
              <input
                id="nodeName"
                type="text"
                ref={nameInputRef}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="tslCode" className="form-label">
                TSL Code:
              </label>
              <textarea
                id="tslCode"
                ref={nodeCodeInputRef}
                className="form-textarea"
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                onClick={() => setCustomNodeForm(false)}
                className="button button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const name = nameInputRef.current?.value
                  const code = nodeCodeInputRef.current?.value

                  if (!name || !code) return
                  try {
                    const Node = createCustomNode(code, name)

                    store.setNodes([
                      [
                        new Node(),
                        { x: 0, y: 0 },
                      ],
                    ]);
                    setCustomNodeForm(false)
                  } catch (e) {
                    console.log(e)
                  }
                }}
                className="button button-primary">
                Add
              </button>
            </div>
          </div>
        </div>
      )}
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
              CustomNodes,
              PositionNodes,
              UtilityNodes,
              VaryingNode
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            right: 0,
            top: 0,
            zIndex: 100000000,
            padding: "10px",
          }}
        >
          <button
            onClick={() => {
              store.save();
            }}
            style={{
              backgroundColor: "var(--node-background)",
              color: "var(--text-neutral-color)",
              border: "1px solid var(--border-color)",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: saveState === "SAVING" ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.2s ease",
              opacity: saveState === "SAVING" ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
            disabled={saveState === "SAVING"}
            onMouseOver={(e) => {
              if (saveState !== "SAVING") {
                e.currentTarget.style.backgroundColor = "var(--border-color)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "var(--node-background)";
              e.currentTarget.style.transform = "none";
            }}
          >
            {saveState === "SAVING" ? (
              <>
                <span>Saving...</span>
                <div style={{
                  width: "12px",
                  height: "12px",
                  border: "2px solid var(--text-neutral-color)",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }} />
              </>
            ) : saveState === "UNSAVED CHANGES" ? (
              "Save Changes"
            ) : (
              "Saved"
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default App;

