import { useEffect, useRef, useState } from "react";
import { TextureUniform } from "../../nodes/UniformNodes";

export const TextureUniformWindow = ({ node }: { node: TextureUniform }) => {
    const [texture, setTexture] = useState<string>("/uv_grid.jpg");
  
    useEffect(() => {
      const sub = node.value.subscribe((value) => {
        setTexture(value);
      });
  
      return () => {
        sub.unsubscribe();
      };
    }, []);
  
    const inputRef = useRef<HTMLInputElement>(null);
  
    return (
      <div
        // ref={ref}
        style={{
          color: "var(--text-neutral-color)",
          backgroundColor: "var(--node-background)",
          borderBottom: "2px solid var(--border-color)",
          padding: "14px 12px 12px",
          // display: "flex",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "10px 16px",
            backgroundColor: "var(--node-background)",
            borderRadius: "12px",
            cursor: "pointer",
          }}
          onClick={() => {
            inputRef.current?.click();
          }}
        >
          Upload Image
        </div>
        <img
          style={{
            display: "flex",
            width: "100%",
          }}
          src={texture}
        ></img>
        <input
          ref={inputRef}
          type="file"
          style={{
            display: "none",
          }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const blobUrl = URL.createObjectURL(file);
            node.setTexture(blobUrl as string);
          }}
        />
      </div>
    );
  };