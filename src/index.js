import * as Three from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

(function () {
    let threeContainer;
    let scene;
    let camera;
    let renderer;
    let controls;
    let raycaster;
    let pointer;
    let model; // 要展示的模型
    let modelUnits = [];
    let selectedModel;
    let spriteGroup; // 监控点位,
    let isMouseOnCanvas = false;

    init();

    /**
     * 总初始化
     */
    async function init() {
        threeContainer = initContainer();
        scene = initScene();
        camera = initCamera();
        raycaster = initRaycaster();
        renderer = initRenderer(true, true);
        controls = initControls();
        model = await initModel('/city.gltf');
        scene.add(model);
        spriteGroup = initMonitor();
        initEvent();
    }


    /*
    下面把threejs的各个功能逐一初始化
    */



    /**
     * 初始化画布容器
     * @returns {HTMLElement}
     */
    function initContainer() {
        return document.getElementById('container');
    }

    /**
     * 初始化threejs场景
     * @returns {Three.Scene}
     */
    function initScene() {
        let scene = new Three.Scene();

        // 设置光源
        const directionalLight = new Three.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(3000, 5000, 3000);
        //阴影
        directionalLight.shadow.camera.left = -20000;
        directionalLight.shadow.camera.right = 20000;
        directionalLight.shadow.camera.top = 5000;
        directionalLight.shadow.camera.bottom = -5000;
        directionalLight.shadow.camera.far = 20000;
        directionalLight.shadow.bias = -0.0001;
        scene.add(directionalLight);
        const ambient = new Three.AmbientLight(0xffffff, 0.3);
        scene.add(ambient);

        return scene;
    }

    /**
     * 初始化threejs相机
     * @returns {Three.Camera}
     */
    function initCamera() {
        let camera = new Three.PerspectiveCamera(20, threeContainer.clientWidth / threeContainer.clientHeight, 1, 20000);
        camera.position.set(0, 1700, 2400);
        camera.lookAt(0, 0, 0);
        return camera;
    }

    /**
     * 初始化threejs的事件射线检测器，
     * threejs的各种事件实现的基本前提
     * @returns {Three.Raycaster}
     */
    function initRaycaster() {
        pointer = new Three.Vector2();
        let raycaster = new Three.Raycaster();
        return raycaster;
    }

    /**
     * 初始化threejs渲染器，
     * 这里需要递归调用requestAnimationFrame来递归渲染3D模型,
     * 模型能不能动主要是在这个函数里面实现
     * 
     * @param {Boolean} openEvent 是否开启事件功能
     * @param {Boolean} openRotate 是否开启模型自旋转
     * @returns {Three.Renderer}
     */
    function initRenderer(openEvent = false, openRotate = false) {
        let renderer = new Three.WebGLRenderer({ alpha: true });
        renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
        renderer.setClearColor(0xffffff, 0);
        renderer.outputColorSpace = Three.SRGBColorSpace;
        //阴影
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = Three.PCFSoftShadowMap;

        threeContainer.appendChild(renderer.domElement);

        const render = () => {
            if (openEvent) {
                // 事件射线位置更新
                raycaster.setFromCamera(pointer, camera);
            }
            if (openRotate) {
                // 模型旋转角度更新
                if (
                    model
                    && spriteGroup
                    && !isMouseOnCanvas
                ) {
                    let unit = Math.PI / 3000;
                    model.rotation.y -= unit;
                    spriteGroup.rotation.y -= unit;
                    if (Math.abs(model.rotation.y) >= 2 * Math.PI) {// 如果旋转角度绝对值大于等于两个Math.PI(即旋转360度)，将y归零，防止内存溢出
                        model.rotation.y = 0;
                        spriteGroup.rotation.y = 0;
                    }
                }
            }

            renderer.render(scene, camera);
            requestAnimationFrame(render);
        }
        render();

        window.onresize = () => {
            renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
            camera.aspect = threeContainer.clientWidth / threeContainer.clientHeight;
            camera.updateProjectionMatrix();
        }
        return renderer;
    }

    /**
     * 初始化threejs控制器，
     * 该控制器主要限制相机的运动轨迹，
     * 非threejs的核心类
     * 
     * @returns {OrbitControls}
     */
    function initControls() {
        let controls = new OrbitControls(camera, renderer.domElement);
        return controls;
    }

    /**
     * 初始化threejs模型文件
     * @param {String} modelPath 模型文件地址
     * @returns {Promise<Three.Scene>}
     */
    async function initModel(modelPath) {

        let loader;
        if (/\.(glb|gltf)$/.test(modelPath)) {
            loader = new GLTFLoader();
        } else if (/\.dae$/.test(modelPath)) {
            loader = new ColladaLoader();
        }
        return new Promise((resolve, reject) => {
            loader.load(modelPath, obj => {

                // 遍历模型
                const material = new Three.MeshStandardMaterial({ color: 0xcccccc });
                const specialMaterial = new Three.MeshStandardMaterial({ color: 0x333333 });
                const specialMaterial2 = new Three.MeshStandardMaterial({ color: 0x666666 });
                const specialMaterial3 = new Three.MeshStandardMaterial({ color: 0x999999 });
                traversalModelTree(obj.scene.children, modelUnit => {

                    // 设置材质
                    modelUnit.material = material;
                    if (modelUnit.name === '地面') {
                        // modelUnit.visible = false;
                        modelUnit.castShadow = true;
                        modelUnit.receiveShadow = true;
                    } else if (
                        modelUnit.name === '扫描'
                        || modelUnit.name === '保留建筑'
                        || modelUnit.name === '精神医学综合楼'
                        || modelUnit.name === '门诊楼'
                        || modelUnit.name === '大号搂'
                        || modelUnit.name === '最后一排'
                        || modelUnit.name === '车库'
                        || modelUnit.name === '顶楼'
                        || modelUnit.name === '样条'
                        || modelUnit.name === '样条1'
                        || modelUnit.name === '平面'
                        || modelUnit.name === '圆柱体'
                    ) {
                        modelUnit.material = specialMaterial;
                        if (
                            modelUnit.name === '平面'
                            || modelUnit.name === '车库'
                        ) {
                            // 这里把模型提高3个单位，否者和地面重叠会出现问题
                            modelUnit.position.y = 3;
                        }
                    } else if (/^Highrise/.test(modelUnit.name)) {
                        modelUnit.material = specialMaterial2;
                    }

                    //阴影
                    modelUnit.castShadow = true;
                });

                resolve(obj.scene);
            }, undefined, err => {
                reject(err);
            })
        })

    }
    
    /**
     * 递归遍历模型树中每一个最小单位模型，并为其使用回调函数
     * @param {Three.Group} models 模型树
     * @param {Function} cb 回调函数
     */
    function traversalModelTree(models, cb) {
        for (let model of models) {
            if (cb && cb instanceof Function) cb(model);
            modelUnits.push(model);
            if (model.children && model.children.length > 0) {
                traversalModelTree(model.children, cb);
            }
        }
    }

    /**
     * 初始化threejs事件
     */
    function initEvent() {
        const modelUnits = [
            // ...model.children,
            ...spriteGroup.children
        ]
        const handlerLeave = () => {
            isMouseOnCanvas = false;
        }
        const handlerMove = ev => {
            isMouseOnCanvas = true;
            if (selectedModel) {
                selectedModel.object.material.opacity = 1;
            }

            let style = ev.target.style;
            style.cursor = 'default';

            pointer.x = (ev.offsetX / threeContainer.scrollWidth) * 2 - 1;
            pointer.y = 1 - (ev.offsetY / threeContainer.scrollHeight) * 2;

            const intersects = raycaster.intersectObjects(modelUnits, true);
            if (intersects[0]) {
                style.cursor = 'pointer';
                selectedModel = intersects[0];
                selectedModel.object.material.opacity = .5;
                // console.log(selectedModel.object.name)
            }

        }
        const handlerDown = ev => {

            pointer.x = (ev.offsetX / threeContainer.scrollWidth) * 2 - 1;
            pointer.y = 1 - (ev.offsetY / threeContainer.scrollHeight) * 2;

            const intersects = raycaster.intersectObjects(modelUnits, true);
            if (intersects[0]) {
                selectedModel = intersects[0];
                alert('监控点被点击了！')
            }
        }

        threeContainer.onpointerleave = handlerLeave;
        threeContainer.onpointermove = handlerMove;
        threeContainer.onpointerdown = handlerDown;
    }

    /**
     * 初始化threejs监控点空间坐标
     * @returns {Three.Group}
     */
    function initMonitor() {
        // 当前模型医院四个角的坐标，这里的位置是相对于你正对医院大门时候的位置，参考
        // { x: 415, y: 30, z: 675 }, // 右下
        // { x: 415, y: 30, z: -670 }, // 右上
        // { x: -355, y: 30, z: 675 }, // 左下
        // { x: -355, y: 30, z: -670 }, // 左上

        // 当前医院大门坐标，参考
        // { x: -15, y: 30, z: 675 },
        // { x: -205, y: 30, z: 675 },

        let monitorInterval = 80.8 // 摄像机间隔
            , adjustLongSide = -2 // 长边间隔调整
            , adjustShortSide = 4.6; // 短边间隔调整
        let monitorHeight = 30; // 摄像机高度
        let monitorScale = 30; // 摄像机图片缩放倍数

        let monitorPositionRight = []; // 右围栏监控点坐标
        for (let i = 0; i < 17; i++) {
            monitorPositionRight.push({ x: 415, y: monitorHeight, z: 675 - i * (monitorInterval + adjustLongSide) });
        }
        let monitorPositionLeft = []; // 左围栏监控点坐标
        for (let i = 0; i < 17; i++) {
            monitorPositionLeft.push({ x: -355, y: monitorHeight, z: -670 + i * (monitorInterval + adjustLongSide) });
        }
        let monitorPositionTop = []; // 上围栏监控点坐标
        for (let i = 0; i < 9; i++) {
            monitorPositionTop.push({ x: 415 - i * (monitorInterval + adjustShortSide), y: monitorHeight, z: -670 });
        }
        let monitorPositionBottom = []; // 下围栏监控点坐标
        for (let i = 0; i < 9; i++) {
            let x = -355 + i * (monitorInterval + adjustShortSide);
            // 摄像机点位不能在大门上方
            if (x < -205 || x > -15) monitorPositionBottom.push({ x, y: monitorHeight, z: 675 });
        }
        let monitorPosition = [
            ...monitorPositionLeft,
            ...monitorPositionRight,
            ...monitorPositionTop,
            ...monitorPositionBottom
        ];
        // console.log(monitorPosition.length);
        // console.log(monitorPositionBottom.length);
        return addMonitorPoint(monitorPosition, monitorScale);
    }

    /**
     * 
     * @param {{x:Number,y:Number,z:Number}[]} pointPositions 监控点空间坐标数组
     * @param {*} scale 摄像机图片缩放倍数
     * @returns {Three.Group}
     */
    function addMonitorPoint(pointPositions, scale = 1) {
        let spriteGroup = new Three.Group();
        for (let pointPosition of pointPositions) {
            let map = new Three.TextureLoader().load('/video_point.png');
            let material = new Three.SpriteMaterial({ map });
            let sprite = new Three.Sprite(material);
            sprite.position.set(pointPosition.x, pointPosition.y, pointPosition.z,);
            sprite.scale.set(scale, scale, scale);
            spriteGroup.add(sprite);
            // console.log(sprite);
            scene.add(spriteGroup)
        }
        return spriteGroup;
    }
})()