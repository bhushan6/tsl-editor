import { useEffect, useRef } from "react";
import { ButtonApi, Pane } from "tweakpane";
import { MaterialNodes } from "../nodes/MaterialNodes";
import { ConstantNodes } from "../nodes/ConstantNodes";
import { MathNodes } from "../nodes/MathNodes";
import { AttributeNodes } from "../nodes/AttributeNodes";
import { PositionNodes } from "../nodes/PositionNodes";
import { UniformNodes } from "../nodes/UniformNodes";
import { VaryingNode } from "three/webgpu";
import { UtilityNodes } from "../nodes/UtilityNodes";
import { LogicNodes } from "../nodes/LogicNodes";

export const Sidebar = ({setCustomNodeForm}: {setCustomNodeForm:  React.Dispatch<React.SetStateAction<boolean>>}) => {
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
  
      const logicNodesFolder = pane.current.addFolder({
        title: "Logic",
      });
  
      Object.keys(LogicNodes).forEach((node) => {
        const btn = logicNodesFolder.addButton({
          title: node,
        });
        makeButtonsDraggable(btn.element, node, "LogicNodes");
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
    return (
        <>
            <div
                className="sidebar-container"
                ref={sidebarRef}
            />
        </>
    )
}