import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import "./App.css";
import { Experience } from "./components/Experience";
import { Node } from "@nodl/core";
import { Circuit, CircuitStore } from "@nodl/react";
import { Add, BaseColorNode, Cos, Mul, UV, Vec3, Vec4 } from "./nodes/UVNode";

const a = new Vec3();
const b = new Vec3();
const c = new Vec3();
const d = new Vec3();
const uvNode = new UV();

const ab = new Add();
const td = new Add();
const ctd = new Mul();
const cosctd = new Cos();
const palette = new Add();
const finalColor = new Vec4();

const baseColor = new BaseColorNode();

a.inputs.a.next(0.5);
a.inputs.b.next(0.5);
a.inputs.c.next(0.5);

b.inputs.a.next(0.5);
b.inputs.b.next(0.5);
b.inputs.c.next(0.5);

c.inputs.a.next(1);
c.inputs.b.next(1);
c.inputs.c.next(1);

d.inputs.a.next(0.263);
d.inputs.b.next(0.416);
d.inputs.c.next(0.557);

// a.outputs.value.connect(ab.inputs.a);
// b.outputs.value.connect(ab.inputs.b);

uvNode.outputs.value.connect(td.inputs.a);
d.outputs.value.connect(td.inputs.b);

c.outputs.value.connect(ctd.inputs.a);
td.outputs.output.connect(ctd.inputs.b);

ctd.outputs.output.connect(cosctd.inputs.a);

ab.outputs.output.connect(palette.inputs.a);
cosctd.outputs.output.connect(palette.inputs.b);

palette.outputs.output.connect(finalColor.inputs.a);

finalColor.outputs.value.connect(baseColor.inputs.a);

const store = new CircuitStore();

const useNodeWindowResolver = () => {
  return useCallback((node: Node) => {
    if (node instanceof Vec3) {
      return <Vec3UI node={node} />;
    } else if (node instanceof BaseColorNode) {
      return <BaseColorUI node={node} />;
    }
  }, []);
};

const min = "-1";
const max = "1";
const step = "0.01";
const Vec3UI = ({ node }: { node: Vec3 }) => {
  const [value, setValue] = useState({
    a: 0,
    b: 0,
    c: 0,
  });
  useEffect(() => {
    const sub1 = node.inputs.a.subscribe((value) => {
      // console.log(value, "a");
      setValue((prev) => {
        return {
          ...prev,
          a: value,
        };
      });
    });

    const sub2 = node.inputs.b.subscribe((value) => {
      // console.log(value, "b");
      setValue((prev) => {
        return {
          ...prev,
          b: value,
        };
      });
    });

    const sub3 = node.inputs.c.subscribe((value) => {
      // console.log(value, "c");
      setValue((prev) => {
        return {
          ...prev,
          c: value,
        };
      });
    });

    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
      sub3.unsubscribe();
    };
  }, []);

  return (
    <div
      style={{
        color: "var(--text-neutral-color)",
        backgroundColor: "var(--node-background)",
        borderBottom: "2px solid var(--border-color)",
        padding: "14px 12px 12px",
      }}
    >
      <div className="slider-container">
        <div className="slider-label">
          <span>A</span>
          <span>: {value.a}</span>
        </div>
        <div className="slider-wrapper">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value.a}
            onChange={(e) => {
              e.stopPropagation();
              node.inputs.a.next(Number(e.target.value));
            }}
            className="slider"
          />
        </div>
      </div>

      <div className="slider-container">
        <div className="slider-label">
          <span>B</span>
          <span>: {value.b}</span>
        </div>
        <div className="slider-wrapper">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value.b}
            onChange={(e) => {
              e.stopPropagation();
              node.inputs.b.next(Number(e.target.value));
            }}
            className="slider"
          />
        </div>
      </div>

      <div className="slider-container">
        <div className="slider-label">
          <span>C</span>
          <span>: {value.c}</span>
        </div>
        <div className="slider-wrapper">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value.c}
            onChange={(e) => {
              e.stopPropagation();

              node.inputs.c.next(Number(e.target.value));
            }}
            capture={true}
            className="slider"
          />
        </div>
      </div>
    </div>
  );
};

const BaseColorUI = ({ node }: { node: BaseColorNode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const experienceRef = useRef<Experience | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const boundBox = canvasRef.current.getBoundingClientRect();

    experienceRef.current = new Experience(canvasRef.current, {
      width: boundBox.width,
      height: boundBox.height,
    });
  }, []);

  useEffect(() => {
    const sub3 = node.outputs.value.subscribe((value) => {
      // console.log(value(), "output>>>>>>>>>>>>>>>>>>>>");
      // experienceRef.current?
      experienceRef.current?.defaultBox(value);
    });

    return () => {
      sub3.unsubscribe();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "300px",
        backgroundColor: "var(--node-background)",
      }}
    />
  );
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};
function App() {
  const nodeWindowResolver = useNodeWindowResolver();

  useLayoutEffect(() => {
    store.setNodes([
      [a, { x: 0, y: 450 }],
      [b, { x: 0, y: 150 }],
      [c, { x: 0, y: -150 }],
      [d, { x: 0, y: -450 }],
      [uvNode, { x: 0, y: -750 }],
      [ab, { x: 300, y: 300 }],
      [td, { x: 300, y: -650 }],
      [ctd, { x: 600, y: -300 }],
      [cosctd, { x: 900, y: -300 }],
      [palette, { x: 1200, y: 300 }],
      [finalColor, { x: 1500, y: 600 }],
      [baseColor, { x: 1800, y: 0 }],
    ]);

    return () => {
      store.dispose();
    };
  }, []);

  useEffect(() => {
    const nodeCanvas = document.getElementsByClassName("canvas")[0];

    if (!nodeCanvas) return;
    const nodeCanvasEle = nodeCanvas as HTMLDivElement;

    let currentScale = 1;
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

  return (
    <>
      <div
        style={{
          height: "100vh",
          width: "100vw",
          position: "relative",
          display: "block",
        }}
      >
        <Circuit
          className={"circuit"}
          store={store}
          nodeWindowResolver={nodeWindowResolver}
        />
      </div>
    </>
  );
}

export default App;
