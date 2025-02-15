import { OrbitControls } from "three/examples/jsm/Addons.js";
import * as THREE from "three/webgpu";
import { Pane } from 'tweakpane';

// Types for geometry parameters
type GeometryParams = {
  box: {
    width: number;
    height: number;
    depth: number;
    widthSegments: number;
    heightSegments: number;
    depthSegments: number;
  };
  sphere: {
    radius: number;
    widthSegments: number;
    heightSegments: number;
    phiStart: number;
    phiLength: number;
    thetaStart: number;
    thetaLength: number;
  };
  plane: {
    width: number;
    height: number;
    widthSegments: number;
    heightSegments: number;
  };
  cylinder: {
    radiusTop: number;
    radiusBottom: number;
    height: number;
    radialSegments: number;
    heightSegments: number;
    openEnded: boolean;
    thetaStart: number;
    thetaLength: number;
  };
  torus: {
    radius: number;
    tube: number;
    radialSegments: number;
    tubularSegments: number;
    arc: number;
  };
};

type GeometryType = keyof GeometryParams;

class GeometryManager {
  private _currentGeometry: THREE.BufferGeometry | null = null;
  private _currentType: GeometryType | null = "box";
  private _defaultParams: GeometryParams = {
    box: {
      width: 2,
      height: 2,
      depth: 2,
      widthSegments: 1,
      heightSegments: 1,
      depthSegments: 1,
    },
    sphere: {
      radius: 1,
      widthSegments: 32,
      heightSegments: 32,
      phiStart: 0,
      phiLength: Math.PI * 2,
      thetaStart: 0,
      thetaLength: Math.PI,
    },
    plane: {
      width: 2,
      height: 2,
      widthSegments: 1,
      heightSegments: 1,
    },
    cylinder: {
      radiusTop: 1,
      radiusBottom: 1,
      height: 2,
      radialSegments: 32,
      heightSegments: 32,
      openEnded: false,
      thetaStart: 0,
      thetaLength: Math.PI * 2,
    },
    torus: {
      radius: 1,
      tube: 0.4,
      radialSegments: 32,
      tubularSegments: 32,
      arc: Math.PI * 2,
    },
  };

  constructor(private experience: Experience,private mesh: THREE.Mesh) {
    this._currentGeometry = mesh.geometry;
  }

  // Create geometry based on type and parameters
  private createGeometry(
    type: GeometryType,
    params: Partial<GeometryParams[GeometryType]>
  ): THREE.BufferGeometry {
    const mergedParams = {
      ...this._defaultParams[type],
      ...params,
    };

    switch (type) {
      case "box":
        return new THREE.BoxGeometry(
          mergedParams.width,
          mergedParams.height,
          mergedParams.depth,
          mergedParams.widthSegments,
          mergedParams.heightSegments,
          mergedParams.depthSegments
        );
      case "sphere":
        return new THREE.SphereGeometry(
          mergedParams.radius,
          mergedParams.widthSegments,
          mergedParams.heightSegments,
          mergedParams.phiStart,
          mergedParams.phiLength,
          mergedParams.thetaStart,
          mergedParams.thetaLength
        );
      case "plane":
        return new THREE.PlaneGeometry(
          mergedParams.width,
          mergedParams.height,
          mergedParams.widthSegments,
          mergedParams.heightSegments
        );
      case "cylinder":
        return new THREE.CylinderGeometry(
          mergedParams.radiusTop,
          mergedParams.radiusBottom,
          mergedParams.height,
          mergedParams.radialSegments,
          mergedParams.heightSegments,
          mergedParams.openEnded,
          mergedParams.thetaStart,
          mergedParams.thetaLength
        );
      case "torus":
        return new THREE.TorusGeometry(
          mergedParams.radius,
          mergedParams.tube,
          mergedParams.radialSegments,
          mergedParams.tubularSegments,
          mergedParams.arc
        );
      default:
        throw new Error(`Unsupported geometry type: ${type}`);
    }
  }

  // Change geometry type with optional parameters
  public changeGeometry(
    type: GeometryType,
    params: Partial<GeometryParams[typeof type]> = {}
  ) {
    this._currentGeometry = this.createGeometry(type, params);
    this._currentType = type;
    return this._currentGeometry
  }

  // Update current geometry parameters
  public updateGeometryParams(
    params: Partial<GeometryParams[GeometryType]>
  ) {
    if (!this._currentType) {
      throw new Error("No geometry type set");
    }
    // this.mesh =
    return this.changeGeometry(this._currentType, params);
  }

  // Get current geometry type
  public getCurrentType(): GeometryType | null {
    return this._currentType;
  }

  // Get current geometry parameters
  public getCurrentParams(): Partial<GeometryParams[GeometryType]> | null {
    if (!this._currentType) return null;
    return this._defaultParams[this._currentType];
  }

  // Get available geometry types
  public getAvailableTypes(): GeometryType[] {
    return Object.keys(this._defaultParams) as GeometryType[];
  }

  // Get default parameters for a geometry type
  public getDefaultParams(type: GeometryType): GeometryParams[typeof type] {
    return this._defaultParams[type];
  }
}



class GeometryUI {
  private pane: Pane;
  private geometryFolder: any;
  private parametersFolder: any;
  private materialFolder: any;

  constructor(
    private experience: Experience,
    containerElement?: HTMLElement
  ) {
    this.pane = new Pane({
      container: containerElement,
      title: 'Geometry Controls',
      expanded: false
    });

    this.setupGeometryTypeControl();
    this.setupMaterialControls();
    this.setupParametersFolder();
  }

  private setupGeometryTypeControl() {
    const types = this.experience.getAvailableGeometryTypes();

    this.geometryFolder = this.pane.addFolder({
      title: 'Geometry Type',
    });

    this.geometryFolder.addBinding(
      {
        type: this.experience.getCurrentGeometryType() || 'box'
      },
      'type',
      {
        options: types.reduce((acc, type) => {
          acc[type] = type;
          return acc;
        }, {} as Record<string, string>)
      }
    ).on('change', (ev: { value: GeometryType }) => {
      this.experience.changeGeometry(ev.value);
      this.updateParametersFolder(ev.value);
    });
  }

  private setupMaterialControls() {
    this.materialFolder = this.pane.addFolder({
      title: 'Material',
    });


    const materialParams = {
      wireframe: false,
      side: 'front' as 'front' | 'back' | 'double'
    };

    // Add wireframe toggle
    this.materialFolder.addBinding(materialParams, 'wireframe')
      .on('change', (ev: { value: boolean }) => {
        this.experience.updateMaterial({
          wireframe: ev.value
        });
      });

    // Add side options
    this.materialFolder.addBinding(materialParams, 'side', {
      options: {
        front: 'front',
        back: 'back',
        double: 'double'
      }
    }).on('change', (ev: { value: 'front' | 'back' | 'double' }) => {
      const sideMap = {
        front: THREE.FrontSide,
        back: THREE.BackSide,
        double: THREE.DoubleSide
      };
      this.experience.updateMaterial({
        side: sideMap[ev.value]
      });
    });
  }

  private setupParametersFolder() {
    this.parametersFolder = this.pane.addFolder({
      title: 'Parameters',
    });

    const currentType = this.experience.getCurrentGeometryType() || 'box';
    this.updateParametersFolder(currentType);
  }

  private updateParametersFolder(geometryType: GeometryType) {
    // Clear existing parameters
    this.parametersFolder.dispose();
    this.parametersFolder = this.pane.addFolder({
      title: 'Parameters',
    });

    const params = this.experience.getCurrentGeometryParams();
    if (!params) return;

    const bindingParams: Record<string, any> = {};

    switch (geometryType) {
      case 'box':
        this.addBoxParameters(params as GeometryParams['box'], bindingParams);
        break;
      case 'sphere':
        this.addSphereParameters(params as GeometryParams['sphere'], bindingParams);
        break;
      case 'plane':
        this.addPlaneParameters(params as GeometryParams['plane'], bindingParams);
        break;
      case 'cylinder':
        this.addCylinderParameters(params as GeometryParams['cylinder'], bindingParams);
        break;
      case 'torus':
        this.addTorusParameters(params as GeometryParams['torus'], bindingParams);
        break;
    }
  }

  private addBoxParameters(params: GeometryParams['box'], bindingParams: Record<string, any>) {
    bindingParams.width = params.width;
    bindingParams.height = params.height;
    bindingParams.depth = params.depth;
    bindingParams.widthSegments = params.widthSegments;
    bindingParams.heightSegments = params.heightSegments;
    bindingParams.depthSegments = params.depthSegments;

    this.addParameterBindings(bindingParams, {
      width: { min: 0.1, max: 10, step: 0.1 },
      height: { min: 0.1, max: 10, step: 0.1 },
      depth: { min: 0.1, max: 10, step: 0.1 },
      widthSegments: { min: 1, max: 128, step: 1 },
      heightSegments: { min: 1, max: 128, step: 1 },
      depthSegments: { min: 1, max: 128, step: 1 },
    });
  }

  private addSphereParameters(params: GeometryParams['sphere'], bindingParams: Record<string, any>) {
    bindingParams.radius = params.radius;
    bindingParams.widthSegments = params.widthSegments;
    bindingParams.heightSegments = params.heightSegments;
    bindingParams.phiStart = params.phiStart;
    bindingParams.phiLength = params.phiLength;
    bindingParams.thetaStart = params.thetaStart;
    bindingParams.thetaLength = params.thetaLength;

    this.addParameterBindings(bindingParams, {
      radius: { min: 0.1, max: 10, step: 0.1 },
      widthSegments: { min: 3, max: 128, step: 1 },
      heightSegments: { min: 2, max: 128, step: 1 },
      phiStart: { min: 0, max: Math.PI * 2, step: 0.1 },
      phiLength: { min: 0, max: Math.PI * 2, step: 0.1 },
      thetaStart: { min: 0, max: Math.PI, step: 0.1 },
      thetaLength: { min: 0, max: Math.PI, step: 0.1 },
    });
  }

  private addPlaneParameters(params: GeometryParams['plane'], bindingParams: Record<string, any>) {
    bindingParams.width = params.width;
    bindingParams.height = params.height;
    bindingParams.widthSegments = params.widthSegments;
    bindingParams.heightSegments = params.heightSegments;

    this.addParameterBindings(bindingParams, {
      width: { min: 0.1, max: 10, step: 0.1 },
      height: { min: 0.1, max: 10, step: 0.1 },
      widthSegments: { min: 1, max: 128, step: 1 },
      heightSegments: { min: 1, max: 128, step: 1 },
    });
  }

  private addCylinderParameters(params: GeometryParams['cylinder'], bindingParams: Record<string, any>) {
    bindingParams.radiusTop = params.radiusTop;
    bindingParams.radiusBottom = params.radiusBottom;
    bindingParams.height = params.height;
    bindingParams.radialSegments = params.radialSegments;
    bindingParams.heightSegments = params.heightSegments;
    bindingParams.openEnded = params.openEnded;
    bindingParams.thetaStart = params.thetaStart;
    bindingParams.thetaLength = params.thetaLength;

    this.addParameterBindings(bindingParams, {
      radiusTop: { min: 0, max: 5, step: 0.1 },
      radiusBottom: { min: 0, max: 5, step: 0.1 },
      height: { min: 0.1, max: 10, step: 0.1 },
      radialSegments: { min: 3, max: 64, step: 1 },
      heightSegments: { min: 1, max: 64, step: 1 },
      openEnded: {},
      thetaStart: { min: 0, max: Math.PI * 2, step: 0.1 },
      thetaLength: { min: 0, max: Math.PI * 2, step: 0.1 },
    });
  }

  private addTorusParameters(params: GeometryParams['torus'], bindingParams: Record<string, any>) {
    bindingParams.radius = params.radius;
    bindingParams.tube = params.tube;
    bindingParams.radialSegments = params.radialSegments;
    bindingParams.tubularSegments = params.tubularSegments;
    bindingParams.arc = params.arc;

    this.addParameterBindings(bindingParams, {
      radius: { min: 0.1, max: 5, step: 0.1 },
      tube: { min: 0.1, max: 2, step: 0.1 },
      radialSegments: { min: 3, max: 64, step: 1 },
      tubularSegments: { min: 3, max: 128, step: 1 },
      arc: { min: 0, max: Math.PI * 2, step: 0.1 },
    });
  }

  private _timeoutId: null | number = null

  private addParameterBindings(
    bindingParams: Record<string, any>,
    configs: Record<string, any>
  ) {
    Object.keys(bindingParams).forEach(param => {
      this.parametersFolder
        .addBinding(bindingParams, param, configs[param])
        .on('change', () => {
          this._timeoutId && clearTimeout(this._timeoutId)
          this._timeoutId = setTimeout(() => this.experience.updateGeometryParams(bindingParams), 300)
        });
    });
  }

  public dispose() {
    this.pane.dispose();
  }
}

export class Experience {
  private _canvas: HTMLCanvasElement;

  private _scene: THREE.Scene;
  private _camera: THREE.PerspectiveCamera;
  private _renderer: THREE.WebGPURenderer;
  private _controls: OrbitControls;
  private _size: { width: number; height: number } | null = null;

  private _parent = new THREE.Object3D();
  private _box: THREE.Mesh | null = null;

  private _boxMaterial: THREE.MeshStandardNodeMaterial | null = null;

  private _geometryManager: GeometryManager | null = null;
  private _ui: GeometryUI | null = null;

  private _deleteGeomCronJobId: null | number = null

  constructor(
    canvas: HTMLCanvasElement,
    size?: { width: number; height: number },
    uiContainer?: HTMLDivElement
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

    const boxGeometry = new THREE.BoxGeometry(
      2,
      2,
      2,
      1,
      1,
      1
    );

    const boxMaterial = new THREE.MeshStandardNodeMaterial({
      transparent: false,
      side: THREE.FrontSide,
    });

    this._boxMaterial = boxMaterial;

    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    this._box = box;
    this._scene.add(this._parent);

    this._parent.add(box)

    this._geometryManager = new GeometryManager(this, this._box);
    
    this._ui = new GeometryUI(this, uiContainer);


    
  }

  private _oldGeoms: THREE.BufferGeometry[] = []

  private _deleteGeoms = () => {
    
    if(this._oldGeoms.length > 5){
      this._oldGeoms.forEach((geom) => {
       try {
        geom.dispose()
        console.log(`Deleted ${geom.uuid} Geom`);
       } catch (error) {
        console.log(`Issue deleting ${geom.uuid} Geom`, error);
        
       }
       
      })
      this._oldGeoms = []
    }
  }
  // Method to change geometry type
  public changeGeometry(
    type: GeometryType,
    params: Partial<GeometryParams[typeof type]> = {}
  ) {
    if (!this._geometryManager || !this._box || !this._boxMaterial) return;
    this._parent.remove(this._box)
    const oldGeometry = this._box.geometry
    this._oldGeoms.push(oldGeometry)
    const newGeom = this._geometryManager?.changeGeometry(type, params);
    this._box = new THREE.Mesh(newGeom, this._boxMaterial!)
    this._parent.add(this._box)
    this._renderer.render(this._scene, this._camera);
    this._deleteGeoms()
  }

  // Method to update geometry parameters
  public updateGeometryParams(params: Partial<GeometryParams[GeometryType]>) {
    if (!this._geometryManager || !this._box || !this._boxMaterial) return;
    this._parent.remove(this._box)
    const oldGeometry = this._box.geometry
    this._oldGeoms.push(oldGeometry)
    const newGeom = this._geometryManager.updateGeometryParams(params);
    this._box = new THREE.Mesh(newGeom, this._boxMaterial)
    this._parent.add(this._box)
    this._renderer.render(this._scene, this._camera);
    this._deleteGeoms()
  }

  public updateMaterial(params: {
    wireframe?: boolean;
    side?: THREE.Side;
  }) {
    if (!this._boxMaterial) return;

    if (params.wireframe !== undefined) {
      this._boxMaterial.wireframe = params.wireframe;
    }

    if (params.side !== undefined) {
      this._boxMaterial.side = params.side;
    }

    this._boxMaterial.needsUpdate = true;
    this._renderer.render(this._scene, this._camera);
  }


  // Method to get current geometry type
  public getCurrentGeometryType() {
    return this._geometryManager?.getCurrentType() ?? null;
  }

  // Method to get available geometry types
  public getAvailableGeometryTypes() {
    return this._geometryManager?.getAvailableTypes() ?? [];
  }

  // Method to get current geometry parameters
  public getCurrentGeometryParams() {
    return this._geometryManager?.getCurrentParams() ?? null;
  }

  // Method to get default parameters for a geometry type
  public getGeometryDefaultParams(type: GeometryType) {
    return this._geometryManager?.getDefaultParams(type) ?? null;
  }

  public updateNode = (nodeName: keyof THREE.MeshStandardNodeMaterial, node: () => THREE.Node) => {
    if (this._box) {
      if (!this._boxMaterial) throw new Error("No material found");

      this._boxMaterial[nodeName] = node();
      this._boxMaterial.needsUpdate = true;

      this._renderer.render(this._scene, this._camera);
    }
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


  private _currentAnimationFrame: number | null = null;

  private animate = () => {
    this._controls.update();
    this._renderer.render(this._scene, this._camera);
    this._currentAnimationFrame = requestAnimationFrame(this.animate);
  };

  public startRendering() {
    if (this._currentAnimationFrame === null) {
      this.animate();
    }
  }

  public stopRendering() {
    if (this._currentAnimationFrame !== null) {
      cancelAnimationFrame(this._currentAnimationFrame);
      this._currentAnimationFrame = null;
    }
  }

  public dispose() {
    this._deleteGeomCronJobId && clearInterval(this._deleteGeomCronJobId)
    this.stopRendering();
    this._ui?.dispose();
  }
}
