import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import "./App.css";
import { Circuit, CircuitStore } from "./nodl-react";
import { toCartesianPoint } from "./nodl-react/utils/coordinates/coordinates";
import { EditorEventEmitter, SAVE_STATE_TYPE } from "./nodes/utils";
import { createCustomNode } from "./nodes/CustomNode";
import { Sidebar } from "./components/Sidebar";
import { useNodeWindowResolver } from "./components/NodeWindows";
import { nodesPool } from "./nodes";

const store = new CircuitStore();


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
    return () => {
      EditorEventEmitter.removeAllListeners("changed");
      EditorEventEmitter.removeAllListeners("saveStateChanged");
      store.dispose();
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

  const [customNodeForm, setCustomNodeForm] = useState(false)

  const nameInputRef = useRef<HTMLInputElement>(null);
  const nodeCodeInputRef = useRef<HTMLTextAreaElement>(null);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!containerBound) return;

    const [name, poolName] = e.dataTransfer
      .getData("text/plain")
      .split("-");

    const boundingRect = containerBound;

    const x = ((e.clientX - boundingRect.left) / store._editorTransformation.scale) - store._editorTransformation.translation.x;
    const y = ((e.clientY - boundingRect.top) / store._editorTransformation.scale) - store._editorTransformation.translation.y;

    const pool = nodesPool[poolName];
    if (!pool) return;
    const node = pool[name];
    if (!node) return;
    const nodeInstance = new node();

    store.setNodes([
      [
        nodeInstance,
        toCartesianPoint(boundingRect.width / store._editorTransformation.scale, boundingRect.height / store._editorTransformation.scale, x, y),
      ],
    ]);
  }

  const onDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }

  const onCustomNodeCreateClick = () => {
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
      console.error(e)
    }
  }

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
                onClick={onCustomNodeCreateClick}
                className="button button-primary">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="main-container">
        <Sidebar setCustomNodeForm={setCustomNodeForm} />

        <div
          ref={circuitContainer}
          className="circuit-container"
          onDrop={onDrop}
          onDragOver={onDrag}
        >
          <Circuit
            className="circuit"
            store={store}
            nodeWindowResolver={nodeWindowResolver}
          />
        </div>

        <div className="save-button-container">
          <button
            className={`save-button ${saveState === "SAVING" ? "save-button--saving" : ""}`}
            onClick={() => store.save()}
            disabled={saveState === "SAVING"}
          >
            {saveState === "SAVING" ? (
              <>
                <span>Saving...</span>
                <div className="loading-spinner" />
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

