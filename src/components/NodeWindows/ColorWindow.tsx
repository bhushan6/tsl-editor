import { useEffect, useRef } from "react";
import { Pane } from "tweakpane";
import { Color } from "../../nodes/ConstantNodes";
import WindowWrapper from "./WindowWrapper";

export const ColorWindow = ({ node }: { node: Color }) => {
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
  
    return <WindowWrapper ref={ref} />
  }