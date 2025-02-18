import { Connection, Input, Node, NodeSerialized, Output } from "../../../nodl-core";
import { isEmpty, isEqual, xorWith } from "lodash";
import { autorun, IReactionDisposer, makeAutoObservable } from "mobx";
import { createContext } from "react";

import { NODE_CENTER } from "../../constants";
import { normalizeBounds, withinBounds } from "../../utils/bounds/bounds";
import { Bounds } from "../../utils/bounds/bounds.types";
import { fromCanvasCartesianPoint } from "../../utils/coordinates/coordinates";
import {
  MousePosition,
  NodeWithPosition,
  StoreProviderValue,
} from "./CircuitStore.types";
import { currentScale, currentTranslate, getNodeByName } from "../../../App";
import { createCustomNode } from "../../../nodes/CustomNode";
import { EditorEventEmitter } from "../../../nodes/utils";

export class CircuitStore {
  /** Associated Nodes */
  public nodes: Node[] = [];
  /** Hidden Nodes */
  private _hiddenNodes: Map<Node["id"], Node> = new Map()
  private _hiddenNodesPosition: Map<Node["id"], { x: number; y: number }> = new Map()
  /** Associated Node Elements */
  public nodeElements: Map<Node["id"], HTMLDivElement> = new Map();
  /** Node Positions */
  public nodePositions: Map<Node["id"], { x: number; y: number }> = new Map();
  /** Associated Port Elements */
  public portElements: Map<Input["id"] | Output["id"], HTMLDivElement> =
    new Map();
  /** Selected Nodes */
  public selectedNodes: Node[] = [];
  /** Draft Connection Source */
  public draftConnectionSource: Output | null = null;
  /** Selection bounds */
  public selectionBounds: Bounds | null = null;
  /** Mouse Position */
  public mousePosition: MousePosition = { x: 0, y: 0 };

  /** Selection Bounds autorun disposer */
  private selectionBoundsDisposer: IReactionDisposer;

  private _saveHandle: number | null = null;
  private _unsavedChanges = false;

  private _isShiftPressed = false

  constructor() {
    makeAutoObservable(this);

    this.selectionBoundsDisposer = this.onSelectionBoundsChange();

    // Add beforeunload event listener
    window.addEventListener('beforeunload', (e) => {
      if (this._unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    });

    const checkIfShiftPressed = (e: KeyboardEvent) => {
      this._isShiftPressed = e.shiftKey
    }
    window.addEventListener("keydown", checkIfShiftPressed)
    window.addEventListener("keyup", checkIfShiftPressed)
  }

  /** All associated connections */
  public get connections() {
    return this.nodes
      .flatMap((node) => node.connections)
      .filter((value, index, self) => self.indexOf(value) === index);
  }

  /** Sets the associated nodes */
  public setNodes(nodesWithPosition: NodeWithPosition[]) {
    EditorEventEmitter.emit("saveStateChanged", {state: "UNSAVED CHANGES"})
    for (const [node, position] of nodesWithPosition) {
      if(node.visible){
        this.nodes.push(node);
        this.nodePositions.set(node.id, position);
      }else{
        this._hiddenNodes.set(node.id, node);
        this._hiddenNodesPosition.set(node.id, position)
      }
    }
    this.save()
  }

  public unHideNode(id: string) {
    const hiddenNode = this._hiddenNodes.get(id);
    if(!hiddenNode) {
      console.warn(`Node with id: ${id} does not exist`);
      
      return;
    };

    const position = this._hiddenNodesPosition.get(id)
    if(!position) throw new Error(`${id} Node's position don't exist`)

    hiddenNode.visible = true
    this.setNodes([[hiddenNode, position]])

  }

  public hideNode(id: string){
    let foundNode: Node | undefined;
    this.nodes = this.nodes.filter(node => {
      if (node.id === id) {
        foundNode = node;
        return false;
      }
      return true;
    });

    if (!foundNode) {
      console.warn(`Node with id: ${id} does not exist`);
      return;
    }
    const nodePosition = this.nodePositions.get(id)
    if(!nodePosition) throw new Error("Node position don't exist")
    this._hiddenNodesPosition.set(id, nodePosition)
    this._hiddenNodes.set(id, foundNode);
    foundNode.visible = false
    this.nodeElements.delete(id);
    this.nodePositions.delete(id);
  }

  /** Removes a node from the store */
  public removeNode(nodeId: Node["id"]) {
    EditorEventEmitter.emit("saveStateChanged", {state: "UNSAVED CHANGES"})
    this.nodes = this.nodes.filter((node) => node.id !== nodeId);
    this.nodeElements.delete(nodeId);
    this.nodePositions.delete(nodeId);
    this.save()
  }

  /** Associates a given Node instance with an HTML Element */
  public setNodeElement(nodeId: Node["id"], portElement: HTMLDivElement): void {
    this.nodeElements.set(nodeId, portElement);
  }

  /** Clears a given Node's associated HTML Element from store */
  public removeNodeElement(nodeId: Node["id"]): void {
    this.nodeElements.delete(nodeId);
  }

  /** Associates a given Input or Output instance with an HTML Element */
  public setPortElement(
    portId: Input["id"] | Output["id"],
    portElement: HTMLDivElement
  ): void {
    this.portElements.set(portId, portElement);
  }

  /** Clears a given Input's or Output's associated HTML Element from store */
  public removePortElement(portId: Input["id"] | Output["id"]): void {
    this.portElements.delete(portId);
  }

  /** Sets an Output as the current draft connection source */
  public setDraftConnectionSource(source: Output | null): void {
    this.draftConnectionSource = source;
  }

  /** Sets an Output as the current draft connection source */
  public commitDraftConnection<T>(target: Input<T>): Connection<T> | void {
    if (this.draftConnectionSource) {
      const connection = this.draftConnectionSource.connect(target);

      this.setDraftConnectionSource(null);
      return connection;
    }
  }

  /** Selects the given nodes */
  public selectNodes(nodes: Node[]): void {
    if(this._isShiftPressed){
      this.selectedNodes = [...this.selectedNodes, ...nodes]
    }else {
      
      this.selectedNodes = nodes;
    }
    EditorEventEmitter.emit("selectionChanged", {nodes: nodes})
  }

  /** Sets the selection bounds */
  public setSelectionBounds(bounds: Bounds | null): void {
    this.selectionBounds = bounds;
  }

  /** Sets the mouse position */
  public setMousePosition(mousePosition: MousePosition): void {
    this.mousePosition = mousePosition;
  }

  /** Sets a node's position */
  public setNodePosition(
    nodeId: Node["id"],
    position: { x: number; y: number }
  ) {
    this.nodePositions.set(nodeId, position);
  }

  /** Remove a node's position */
  public removeNodePosition(nodeId: Node["id"]) {
    this.nodePositions.delete(nodeId);
  }

  /** Returns the node with the associated port */
  public getNodeByPortId(portId: Input["id"] | Output["id"]) {
    return this.nodes.find((node) => {
      return [
        ...Object.values(node.inputs),
        ...Object.values(node.outputs),
      ].some((port) => port.id === portId);
    });
  }

  /** Disposes the store by cleaning up effects */
  public dispose(): void {
    this.nodes = [];
    this.nodeElements.clear();
    this.nodePositions.clear();
    this.portElements.clear();
    this.selectedNodes = [];
    this.selectionBounds = null;
    this.draftConnectionSource = null;
    this.mousePosition = { x: 0, y: 0 };

    this.selectionBoundsDisposer();
    
    // Clean up the idle callback if it exists
    if (this._saveHandle !== null) {
      window.cancelIdleCallback(this._saveHandle);
    }
    
    // Remove the beforeunload listener
    window.removeEventListener('beforeunload', () => {});
  }

  /** Automatically selects the nodes which are within the selection bounds */
  private onSelectionBoundsChange(): IReactionDisposer {
    return autorun(() => {
      if (this.selectionBounds) {
        const bounds = normalizeBounds(this.selectionBounds);

        const selectionCandidates = [];

        for (const node of this.nodes) {
          const nodeElement = this.nodeElements.get(node.id);

          if (nodeElement) {
            const nodeRect = nodeElement.getBoundingClientRect();

            const nodePosition = this.nodePositions.get(node.id);

            if (
              nodePosition &&
              withinBounds(bounds, {
                ...fromCanvasCartesianPoint(
                  nodePosition.x - NODE_CENTER,
                  nodePosition.y
                ),
                width: nodeRect.width,
                height: nodeRect.height,
              })
            ) {
              selectionCandidates.push(node);
            }
          }
        }

        if (
          !isEmpty(xorWith(this.selectedNodes, selectionCandidates, isEqual))
        ) {
          this.selectNodes(selectionCandidates);
        }
      }
    });
  }

  private serialize = () => {
    EditorEventEmitter.emit("saveStateChanged", {state: "SAVING"})

    
    const serializedNodes: NodeSerialized[] = []
    this.nodes.forEach(node => {
      const pos = this.nodePositions.get(node.id)
      if (!pos) throw new Error("No position found for node")
      serializedNodes.push({ ...node.serialize(), position: { x: pos.x, y: pos.y } })
    })
    localStorage.setItem("nodes", JSON.stringify(serializedNodes))
    localStorage.setItem("editor-settings", JSON.stringify({ currentScale, currentTranslate }))
    
    this._unsavedChanges = false;
    EditorEventEmitter.emit("saveStateChanged", {state: "SAVED"})
  }

  public save = () => {
    this._unsavedChanges = true;
    
    // Cancel previous save if pending
    if (this._saveHandle !== null) {
      window.cancelIdleCallback(this._saveHandle);
    }

    // Schedule new save when thread is idle
    this._saveHandle = window.requestIdleCallback(
      () => {
        this.serialize();
        this._saveHandle = null;
      },
      { timeout: 2000 } // Ensure it runs within 2 seconds even if the system is busy
    );
  }

  public loadFromJson = () => {
    const data = localStorage.getItem("nodes")
    const nodes: [Node, { x: number; y: number }][] = []
    if (data) {
      const deserialized = JSON.parse(data) as NodeSerialized[];
      const connectionMap = new Map<string, string>()
      const ouputNodeMap = new Map<string, { node: Node, name: string }>()
      const inputNodeMap = new Map<string, { node: Node, name: string }>()

      // console.log();


      deserialized.forEach(element => {
        const NodeEle = element.type === "CustomNode" ? createCustomNode(element.outputs.value.value) : getNodeByName(element.type);
        if (!NodeEle) throw new Error(`${element.type} Node not found`)
        const nodeInstance = new NodeEle() as Node;
        const nodePosition = element.position
        // console.log(nodeInstance);


        nodes.push([nodeInstance, nodePosition])

        //@ts-expect-error 
        if (element.internalValue && nodeInstance.deserialize) {
          //@ts-expect-error 
          nodeInstance.deserialize(element.internalValue);
        }

        nodeInstance.visible = true
        Object.keys(element.inputs).forEach((inputKey) => {
          const inputData = element.inputs[inputKey]
          const serializedData = String(inputData.value.value)
          const data = JSON.parse(serializedData)
          const type = inputData.value.type
          const id = String(inputData.id)


          if (type === "CONNECTED") {
            connectionMap.set(id, data.fromId)
            inputNodeMap.set(id, { node: nodeInstance, name: inputKey })
          } else if (type === "PRIMITIVE") {

            if (!nodeInstance.setValue) {
              nodeInstance.inputs[inputKey].next(() => data)
            }
          } else if (type === "NODE") {
            //TODO : handle this condition
          }

          nodeInstance.inputs[inputKey].id = id
        })

        Object.keys(element.outputs).forEach((outputKey) => {
          const outputData = element.outputs[outputKey]
          const id = String(outputData.id)
          ouputNodeMap.set(id, { node: nodeInstance, name: outputKey })
          nodeInstance.outputs[outputKey].id = id
        })

        // nodes.forEach(node => store.setNode)

      })
      this.setNodes(nodes)
      setTimeout(() => {
        connectionMap.forEach((outputId, inputId) => {
          const inputNode = inputNodeMap.get(inputId)
          const outputNode = ouputNodeMap.get(outputId)
          if (inputNode && outputNode) {
            const input = inputNode.node.inputs[inputNode.name]
            const output = outputNode.node.outputs[outputNode.name]
            // console.log(input, output); 

            try {
              console.log({ in: inputNode.name, out: outputNode.name });
              output?.connect(input)
            } catch (e) {
              console.error(e);
            }

          }
        })
      }, 1000)

    }
  }
}

const defaultStoreProviderValue: StoreProviderValue = {
  store: new CircuitStore(),
};

export const StoreContext = createContext(defaultStoreProviderValue);
