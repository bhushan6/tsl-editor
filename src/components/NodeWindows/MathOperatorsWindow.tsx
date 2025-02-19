import { useEffect, useRef } from "react";
import { Subscription } from "rxjs";
import { Pane } from "tweakpane";
import WindowWrapper from "./WindowWrapper";

export const MathOperatorWindow = ({ node }) => {
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
        <WindowWrapper
            ref={ref}
        />
    );
};