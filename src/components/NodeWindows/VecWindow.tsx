import { useEffect, useRef } from "react";
import { Vec3, Vec4, Vec2, Float, Int, Uint, Mat2, Mat3, Mat4, IVec2, IVec3, IVec4, UVec2, UVec3, UVec4, BVec2, BVec3, BVec4 } from "../../nodes/ConstantNodes";
import { Pane } from "tweakpane";
import { Subscription } from "rxjs";
import WindowWrapper from "./WindowWrapper";

export const VecWindow = ({ node }: { node: Vec3 | Vec4 | Vec2 | Float | Int | Uint | Mat2 | Mat3 | Mat4 | IVec2 | IVec3 | IVec4 | UVec2 | UVec3 | UVec4 | BVec2 | BVec3 | BVec4 }) => {
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
        <WindowWrapper
            ref={ref}
        />
    );
};