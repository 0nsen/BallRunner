// variables

var gameWidth = 1200;
var gameHeight = 675;

var scene;
var camera;
var renderer;

var ballColor = "#F5CB5C";
var ballRadius = 5;
var ballDetail = 1;
var ballSpeed = 0;
var ballAcceleration = 0.1;
var ball;

var sunLight;
var sunLightColor = "#FC6471";

var fogColor = "#F2F7F2";

var hemisphereLight;
var hemisphereLightColorTop = "#B23A48";

var cylinderColor = "#003844";
var cylinderRadius = 200;
var cylinderHeight = 200;
var cylinderRadialSegments = 30;
var cylinderSpeed = 2;
var cylinder;

function addLight() {
    hemisphereLight = new THREE.HemisphereLight(hemisphereLightColorTop, cylinderColor, 1.5);
    
    sunLight = new THREE.DirectionalLight(sunLightColor, 3);
    sunLight.position.set(0, 300, -50);
    sunLight.castShadow = true;
    sunLight.target = ball; // Otherwise the ball wouldn't cast shadow

    scene.add(hemisphereLight, sunLight);

    scene.fog = new THREE.FogExp2(fogColor, 0.012);
}

function addPlatform() {
    var cylinderGeometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderHeight, cylinderRadialSegments);
    var cylinderMaterial = new THREE.MeshStandardMaterial({color: cylinderColor});

    cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

    cylinder.receiveShadow = true;

    cylinder.rotation.z = 90 * Math.PI/180;

    scene.add(cylinder);
}

function addBall() {
    var ballGeometry = new THREE.DodecahedronGeometry(ballRadius, ballDetail);
    var ballMaterial = new THREE.MeshStandardMaterial({color: ballColor});

    ball = new THREE.Mesh(ballGeometry, ballMaterial);

    ball.castShadow = true;
    ball.receiveShadow = true;

    ball.position.y = 205;

    scene.add(ball);
}

function userInput(keyEvent) {
    if (keyEvent.keyCode == 37) {   // Left
        if (ball.position.x >= -55 && ballSpeed > -2) {
            ballSpeed -= ballAcceleration; 
        }
        else ballSpeed = ballSpeed; // Limit max speed
    }
    else if (keyEvent.keyCode == 39) {  // Right
        if (ball.position.x <= 55 && ballSpeed < 2) {
            ballSpeed += ballAcceleration; 
        }
        else ballSpeed = ballSpeed; // Limit max speed
    }
}

function createScene() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, gameWidth/gameHeight, 0.1, 1000 );
    camera.rotation.x = -45 * Math.PI/180;
    camera.position.y = 250;
    camera.position.z = 20;

    // camera.rotation.y = 90 * Math.PI/180;
    // camera.position.y = 210;
    // camera.position.z = 0;
    // camera.position.x = 150;
    
    renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize(gameWidth, gameHeight);
    document.querySelector("#game").appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    addBall();
    addPlatform();
    addLight();

    document.addEventListener("keydown", userInput);
}

function animate() {
    renderer.render(scene,camera);  // Draw scene
    window.requestAnimationFrame(animate);  // Loop animate()

    // Game Logic 
    
    ball.rotation.x -= cylinderSpeed;
    ball.position.x += ballSpeed;

    if (ball.position.x > 55 || ball.position.x < -55) {
       ballSpeed = -ballSpeed; // Bounce the ball back once it hits the edge
    }

    cylinder.rotation.x += cylinderSpeed;
}

function setup() {
    createScene();
    animate();
}