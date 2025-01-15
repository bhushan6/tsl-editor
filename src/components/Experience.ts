import { OrbitControls } from "three/examples/jsm/Addons.js";
import * as THREE from "three/webgpu";
import {
  uv,
  vec4,
  float,
  int,
  uint,
  bool,
  color,
  Fn,
  add,
  mul,
  sub,
  div,
  mod,
  modInt,
  equal,
  lessThan,
  greaterThan,
  lessThanEqual,
  greaterThanEqual,
  abs,
  vec2,
  acos,
  asin,
  atan,
  atan2,
  clamp,
  ceil,
  cos,
  cross,
  degrees,
  distance,
  dot,
  floor,
  fract,
  length,
  log,
  vec3,
  uniform,
  time,
  texture,
} from "three/tsl";

export class Experience {
  private _canvas: HTMLCanvasElement;

  private _scene: THREE.Scene;
  private _camera: THREE.PerspectiveCamera;
  private _renderer: THREE.WebGPURenderer;
  private _controls: OrbitControls;
  private _size: { width: number; height: number } | null = null;
  constructor(
    canvas: HTMLCanvasElement,
    size?: { width: number; height: number }
  ) {
    this._canvas = canvas;
    if (size) {
      this._size = size;
    }
    this._camera = new THREE.PerspectiveCamera(
      25,
      this._size
        ? this._size.width / this._size.height
        : window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this._camera.position.set(0, 0, 10);

    this._scene = new THREE.Scene();

    this._renderer = new THREE.WebGPURenderer({
      antialias: true,
      canvas: this._canvas,
    });
    this._renderer.setPixelRatio(window.devicePixelRatio);

    if (this._size) {
      this._renderer.setSize(this._size.width, this._size.height);
    } else {
      this._renderer.setSize(window.innerWidth, window.innerHeight);
    }

    this._renderer.setAnimationLoop(this.animate);

    this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    this._controls.enableDamping = true;
    this._controls.minDistance = 0.1;
    this._controls.maxDistance = 50;
    this._controls.target.y = 0;
    this._controls.target.z = 0;
    this._controls.target.x = 0;

    window.addEventListener("resize", this.onWindowResize);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 5, 5);
    this._scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight2.position.set(-5, 5, 0);
    this._scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight3.position.set(5, 5, 0);
    this._scene.add(directionalLight3);

    const directionalLight4 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight4.position.set(0, 5, -5);
    this._scene.add(directionalLight4);
  }
  private _box: THREE.Mesh | null = null;
  public defaultBox = (colorNode: () => THREE.Node) => {
    if (this._box) {
      //@ts-expect-error
      this._box.material?.dispose();
      const boxMaterial = new THREE.MeshStandardNodeMaterial({
        transparent: false,
        side: THREE.FrontSide,
      });
      boxMaterial.colorNode = colorNode();

      this._box.material = boxMaterial;
      return;
    }
    const planeSize = { width: 2, height: 2 };
    const boxGeometry = new THREE.BoxGeometry(
      planeSize.width,
      planeSize.height,
      1,
      64,
      64,
      64
    );

    const boxMaterial = new THREE.MeshStandardNodeMaterial({
      transparent: false,
      side: THREE.FrontSide,
    });
    boxMaterial.colorNode = colorNode();

    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    this._scene.add(box);
    this._box = box;
  };

  private onWindowResize = () => {
    if (this._size) {
      this._camera.aspect = this._size.width / this._size.height;
    } else {
      this._camera.aspect = window.innerWidth / window.innerHeight;
    }
    this._camera.updateProjectionMatrix();
    if (this._size) {
      this._renderer.setSize(this._size.width, this._size.height);
    } else {
      this._renderer.setSize(window.innerWidth, window.innerHeight);
    }
  };

  private animate = () => {
    this._controls.update();
    this._renderer.render(this._scene, this._camera);
  };
}
