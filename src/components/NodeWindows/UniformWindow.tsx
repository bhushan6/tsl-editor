import { Pane } from "tweakpane";
import { FloatUniform, Vec2Uniform, Vec3Uniform } from "../../nodes/UniformNodes";
import { useEffect, useRef } from "react";
import WindowWrapper from "./WindowWrapper";

export const UniformWinodw = ({
    node,
}: {
    node: Vec2Uniform | Vec3Uniform | FloatUniform
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
        <WindowWrapper
            ref={ref}
        />
    );
};