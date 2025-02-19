import { Pane } from "tweakpane";
import { UV } from "../../nodes/AttributeNodes";
import { useEffect, useRef } from "react";
import WindowWrapper from "./WindowWrapper";

export const UVWindow = ({ node }: { node: UV }) => {
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
        <WindowWrapper
            ref={ref}
        />
    );
}