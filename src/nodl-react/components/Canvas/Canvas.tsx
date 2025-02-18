/** @jsxImportSource @emotion/react */
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { canvasWrapperStyles, canvasContentStyles } from './Canvas.styles';
import { CanvasProps } from './Canvas.types';
import { StoreContext } from '../../stores/CircuitStore/CircuitStore';
import { MAX_ZOOM, MIN_ZOOM } from '../../constants';
import { fromCartesianPoint } from '../../utils/coordinates/coordinates';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
let timeoutId: null | number = null
let panning = false;
export const Canvas = observer(
    React.forwardRef<HTMLDivElement, CanvasProps>(
        ({ children, size, className, onMouseMove, onClick, onMouseDown, onMouseUp }: CanvasProps, ref) => {
            const scrollRef = React.useRef<HTMLDivElement>(null);
            const internalCanvasRef = React.useRef<HTMLDivElement>(null);

            React.useImperativeHandle(ref, () => internalCanvasRef.current!)

            const { store } = React.useContext(StoreContext);

            React.useEffect(() => {
                if (scrollRef.current) {
                    const { x, y } = fromCartesianPoint(size.width, size.height, 0, 0);
                    const { x: offsetX, y: offsetY } = fromCartesianPoint(
                        scrollRef.current.clientWidth,
                        scrollRef.current.clientHeight,
                        0,
                        0
                    );

                    scrollRef.current.scrollTo({ left: x - offsetX, top: y - offsetY });
                }
            }, []);


            const onWheel = React.useCallback((e: WheelEvent) => {
                e.preventDefault();
                const direction = Math.sign(e.deltaY);
                const zoom = 0.01;
                store._editorTransformation.scale -= zoom * direction

                store._editorTransformation.scale = clamp(store._editorTransformation.scale, MIN_ZOOM, MAX_ZOOM);

                internalCanvasRef.current!.style.transformOrigin = "center";
                internalCanvasRef.current!.style.transform = `scale(${store._editorTransformation.scale}) translate(${store._editorTransformation.translation.x}px, ${store._editorTransformation.translation.y}px)`;
                timeoutId && clearTimeout(timeoutId)
                timeoutId = setTimeout(store.saveEditorTransformation, 500)

            }, [store])

            const onCanvasMouseDown = (e: MouseEvent) => {
                if (e.button === 2) {
                    e.preventDefault();
                    e.stopPropagation();
                    panning = true;
                    internalCanvasRef.current!.style.cursor = "grabbing";
                }
            };

            const onCanvasMouseUp = (e: MouseEvent) => {
                if (e.button === 2) {
                    e.preventDefault();
                    e.stopPropagation();
                    panning = false;
                    internalCanvasRef.current!.style.cursor = "default";
                }
            };

            const onCanvasMouseLeave = (e: MouseEvent) => {
                if (e.button === 2) {
                    panning = false;
                    internalCanvasRef.current!.style.cursor = "default";
                }
            };

            const onBlur = () => {
                panning = false;
                internalCanvasRef.current!.style.cursor = "default";
            };

            const onCanvasMouseMove = (e: MouseEvent) => {
                if (panning) {
                    e.preventDefault();
                    e.stopPropagation();
                    const deltaX = e.movementX;
                    const deltaY = e.movementY;
                    store._editorTransformation.translation.x += deltaX;
                    store._editorTransformation.translation.y += deltaY;
                    internalCanvasRef.current!.style.transform = `scale(${store._editorTransformation.scale}) translate(${store._editorTransformation.translation.x}px, ${store._editorTransformation.translation.y}px)`;
                    timeoutId && clearTimeout(timeoutId)
                    timeoutId = setTimeout(store.saveEditorTransformation, 500)
                }
            };

            React.useEffect(() => {
                if (!internalCanvasRef.current) return
                internalCanvasRef.current.style.transformOrigin = "center";
                internalCanvasRef.current.style.transform = `scale(${store._editorTransformation.scale}) translate(${store._editorTransformation.translation.x}px, ${store._editorTransformation.translation.y}px)`;
                internalCanvasRef.current.addEventListener("wheel", onWheel, { passive: false })
                internalCanvasRef.current.addEventListener("mousedown", onCanvasMouseDown);
            
                internalCanvasRef.current.addEventListener("mouseup", onCanvasMouseUp);
                internalCanvasRef.current.addEventListener("mouseleave", onCanvasMouseLeave);
            
                internalCanvasRef.current.addEventListener("blur", onBlur);
            
                internalCanvasRef.current.addEventListener("mousemove", onCanvasMouseMove);
            
                return () => {
                  internalCanvasRef.current?.removeEventListener("wheel", onWheel);
                  internalCanvasRef.current?.removeEventListener("mousedown", onCanvasMouseDown);
                  internalCanvasRef.current?.removeEventListener("mouseup", onCanvasMouseUp);
                  internalCanvasRef.current?.removeEventListener("mouseleave", onCanvasMouseLeave);
                  internalCanvasRef.current?.removeEventListener("blur", onBlur);
                  internalCanvasRef.current?.removeEventListener("mousemove", onCanvasMouseMove);
                  timeoutId && clearTimeout(timeoutId)
                };

            }, [onWheel, onCanvasMouseDown, onCanvasMouseUp, onBlur, onCanvasMouseMove])

            const onContextMenu = React.useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                e.preventDefault()
            }, [])

            return (
                <div ref={scrollRef} css={canvasWrapperStyles} className={className}>
                    <div
                        ref={internalCanvasRef}
                        css={canvasContentStyles(size)}
                        className="canvas"
                        children={children}
                        onMouseMove={onMouseMove}
                        onMouseDown={onMouseDown}
                        onMouseUp={onMouseUp}
                        onClick={onClick}
                        onContextMenu={onContextMenu}
                    />
                </div>
            );
        }
    )
);
