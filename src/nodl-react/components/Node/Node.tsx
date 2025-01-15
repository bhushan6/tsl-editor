/** @jsxImportSource @emotion/react */
import { observer } from "mobx-react-lite";
import * as React from "react";
import Draggable, { DraggableEventHandler } from "react-draggable";

import { NODE_POSITION_OFFSET_X } from "../../constants";
import { useHover } from "../../hooks/useHover/useHover";
import { StoreContext } from "../../stores/CircuitStore/CircuitStore";
import { fromCanvasCartesianPoint } from "../../utils/coordinates/coordinates";
import { Port } from "../Port/Port";
import {
  nodeHeaderWrapperStyles,
  nodeContentWrapperStyles,
  nodeWrapperStyles,
  nodePortsWrapperStyles,
  nodeHeaderActionsStyles,
  nodeActionStyles,
  nodeHeaderNameWrapperStyle,
  nodeWindowWrapperStyles,
  varInputStyles,
} from "./Node.styles";
import { NodeActionProps, NodePortsProps, NodeProps } from "./Node.types";
import { currentScale } from "../../../App";
import { Pane } from "tweakpane";
import { Node as NodeImpl } from "../../../nodl-core";

const NodeName = ({ node }: { node: NodeImpl }) => {
  const [editLocalName, setEditLocalName] = React.useState({
    name: node.localName,
    edit: false,
  });
  const inputRef = React.useRef<HTMLInputElement>(null!);

  React.useEffect(() => {
    if (!inputRef.current) return;

    const setName = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditLocalName((prev) => {
          return { ...prev, edit: false };
        });
        return;
      }
      if (e.key !== "Enter") {
        return;
      }

      const varName = inputRef.current.value.trim();
      if (varName.length > 0) {
        node.localName = varName;
      }
      setEditLocalName(() => {
        return {
          name: node.localName,
          edit: false,
        };
      });
    };

    inputRef.current.addEventListener("keypress", setName);

    return () => {
      inputRef.current?.removeEventListener("keypress", setName);
    };
  }, [editLocalName]);

  return (
    <>
      {editLocalName.edit ? (
        <span>
          <input
            ref={(ref) => {
              inputRef.current = ref!;
              ref?.focus();
            }}
            css={varInputStyles}
            defaultValue={node.localName || ""}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            onFocus={(e) => {
              e.stopPropagation();
            }}
            onBlur={() => {
              const varName = inputRef.current.value.trim();
              if (varName.length > 0) {
                node.localName = varName;
              }

              setEditLocalName(() => {
                return {
                  name: node.localName,
                  edit: false,
                };
              });
            }}
          />
        </span>
      ) : (
        <span
          onDoubleClick={() =>
            setEditLocalName((prev) => {
              return {
                ...prev,
                edit: true,
              };
            })
          }
          style={{
            cursor: "pointer",
            color: "var(--text-neutral-color)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span>{"("}</span>
          <span
            style={{
              maxWidth: "150px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "inline-block",
            }}
          >
            {node.localName || "Db Click to set name"}
          </span>
          <span>{")"}</span>
        </span>
      )}
    </>
  );
};

export const Node = observer(({ node, actions, window }: NodeProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { onMouseEnter, onMouseLeave, isHovered } = useHover();
  const { store } = React.useContext(StoreContext);

  // const [_, setRefresh] = React.useState(0);

  React.useEffect(() => {
    if (ref.current) {
      store.setNodeElement(node.id, ref.current);

      // node.addOnUpdate && node.addOnUpdate(() => setRefresh((r) => r + 1));

      return () => {
        store.removeNodeElement(node.id);
      };
    }
  }, [ref]);

  const handleOnClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!store.selectedNodes?.includes(node)) {
        store.selectNodes([node]);
      }
    },
    [node]
  );

  const handleOnFocus = React.useCallback(() => {
    if (!store.selectedNodes?.includes(node)) {
      store.selectNodes([node]);
    }
  }, [node]);

  const handleOnDrag: DraggableEventHandler = React.useCallback(
    (e, { deltaX, deltaY }) => {
      e.preventDefault();
      e.stopPropagation();

      for (const selectedNode of store.selectedNodes || []) {
        store.setNodePosition(selectedNode.id, {
          x:
            (store.nodePositions.get(selectedNode.id)?.x || 0) +
            (deltaX * 1) / currentScale,
          y:
            (store.nodePositions.get(selectedNode.id)?.y || 0) +
            -((deltaY * 1) / currentScale),
        });
      }
    },
    [node]
  );

  const handleRemoveNode = React.useCallback(() => {
    node.dispose();

    store.removeNode(node.id);
  }, [node]);

  const active = store.selectedNodes?.indexOf(node) !== -1;
  const position = store.nodePositions.get(node.id) || { x: 0, y: 0 };

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const pane = new Pane({ container: containerRef.current });
    const btn = pane.addButton({
      title: "Add Node",
    });

    btn.on("click", () => {});

    return () => {
      pane.dispose();
    };
  }, []);

  return (
    <Draggable
      nodeRef={ref}
      position={fromCanvasCartesianPoint(
        position.x - NODE_POSITION_OFFSET_X,
        position.y
      )}
      onDrag={handleOnDrag}
      handle=".handle"
    >
      <div
        ref={ref}
        css={nodeWrapperStyles(active)}
        onClick={handleOnClick}
        onFocus={handleOnFocus}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        tabIndex={0}
      >
        <div css={nodeHeaderWrapperStyles(active)} className={"handle"}>
          <div css={nodeHeaderNameWrapperStyle}>
            <span
              style={{
                lineHeight: 1.4,
              }}
            >
              {node.name}
              <br />
              <NodeName node={node} />
            </span>
          </div>
          <div css={nodeHeaderActionsStyles(isHovered || active)}>
            <NodeAction color="#ff4444" onClick={handleRemoveNode} />
          </div>
        </div>
        {window ? (
          <div css={nodeWindowWrapperStyles} children={window} />
        ) : undefined}
        {/* <div
          css={nodeContentWrapperStyles}
          style={{
            borderRadius: "0px",
            paddingBottom: "0px",
            paddingTop: "0px",
          }}
        >
          <div ref={containerRef} style={{ minWidth: "80px" }} />
        </div> */}
        <div css={nodeContentWrapperStyles}>
          <NodePorts ports={Object.values(node.inputs)} />
          <NodePorts
            ports={Object.values(node.outputs)}
            isOutputWrapper={true}
          />
        </div>
      </div>
    </Draggable>
  );
});

const NodeAction = ({ color = "#fff", onClick }: NodeActionProps) => {
  return <div css={nodeActionStyles(color)} color={color} onClick={onClick} />;
};

const NodePorts = ({ ports, isOutputWrapper }: NodePortsProps) => {
  return (
    <div style={{ minWidth: "80px", display: "flex", flexDirection: "column" }}>
      <div css={nodePortsWrapperStyles(isOutputWrapper)}>
        {ports.map((port) => (
          <Port key={port.id} port={port} isOutput={!!isOutputWrapper} />
        ))}
      </div>
    </div>
  );
};
