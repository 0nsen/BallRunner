// variables

var gameWidth = 1200;
var gameHeight = 675;

var scene;
var camera;
var renderer;

var clock;

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
var cylinderHeight = 300;
var cylinderRadialSegments = 50;
var cylinderSpeed = 0.01;
var cylinder;

var columnColor = "#307351";
var columnRadius = 5;
var columnHeight = 20;
var columnRadialSegments = 50;

var columnArray;
var columnAmount;
var obstacleArray;

function obstacleBehavior() {
    var obstaclePosition = new THREE.Vector3();

    if (obstacleArray.length > 0) {
        obstacleArray.forEach(obstacle => {
            obstaclePosition.setFromMatrixPosition(obstacle.matrixWorld);
    
            if (obstaclePosition.z > 20) {  // Out of camera vision
                obstacleArray.splice(obstacleArray.indexOf(obstacle), 1);
                columnArray.push(obstacle);
            }
        });
    }
}

function addObstacleRow() {
    var newObstacle;
    
    if (columnArray.length <= 0) return;

    newObstacle = columnArray.pop();
    obstacleArray.push(newObstacle);

    var spherical = new THREE.Spherical(cylinderRadius + (columnHeight/2) - 0.3, 90 * Math.PI/180, 180 * Math.PI/180);
    newObstacle.position.setFromSpherical(spherical);

    newObstacle.position.y = randomize(70, -70, 15);  // Random number between -70 and 70 with a step of 15
    
    cylinder.add(newObstacle);
}

function randomize(max, min, step) {
    var delta, range, rand;

    delta = max - min;
    range = delta / step;
    rand = Math.random();
    rand *= range;
    rand = Math.floor(rand);
    rand *= step;
    rand += min;

    return rand;
}

function createColumn() {
    var columnGeometry = new THREE.CylinderGeometry(columnRadius, columnRadius, columnHeight, columnRadialSegments);
    var columnMaterial = new THREE.MeshStandardMaterial({color: columnColor});

    var column = new THREE.Mesh(columnGeometry, columnMaterial);

    column.castShadow = true;
    column.receiveShadow = true;

    column.rotation.x = 90 * Math.PI/180;

    return column;
}

function addLight() {
    hemisphereLight = new THREE.HemisphereLight(hemisphereLightColorTop, cylinderColor, 1.5);
    
    sunLight = new THREE.SpotLight(sunLightColor, 2);
    sunLight.position.set(50, cylinderRadius + 100, -70);
    sunLight.castShadow = true;

    scene.add(hemisphereLight, sunLight);

    scene.fog = new THREE.FogExp2(fogColor, 0.010);
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

    ball.position.y = cylinderRadius + ballRadius - 0.7;

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
    // camera.position.y = 150;
    // camera.position.x = 300;
    // camera.position.z = 250;

    // camera.rotation.x = -30 * Math.PI/180;
    // camera.rotation.y = -50 * Math.PI/180;
    // camera.position.y = 200;
    // camera.position.z = 200;
    // camera.position.x = -200;
    
    renderer = new THREE.WebGLRenderer({alpha: true});  // Render with transparent background
    renderer.setSize(gameWidth, gameHeight);
    document.querySelector("#game").appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;  // Enable shadow map
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    clock = new THREE.Clock();
    clock.start();

    addPlatform();
    addBall();

    columnArray = [];
    obstacleArray = [];
    columnAmount = randomize(10, 3, 1);
    
    for (var i = 0; i < columnAmount; i++) {
        columnArray.push(createColumn());
    }

    addLight();

    document.addEventListener("keydown", userInput);
}

function animate() {
    renderer.render(scene,camera);  // Draw scene
    window.requestAnimationFrame(animate);  // Loop animate()

    // Ball and cylinder movement
    
    ball.rotation.x -= cylinderSpeed;   // Ball rotates backwards at the same speed as cylinder rotates forwards
    cylinder.rotation.x += cylinderSpeed;

    ball.position.x += ballSpeed;

    if (ball.position.x > 55 || ball.position.x < -55) {
       ballSpeed = -ballSpeed; // Bounce the ball back once it hits the edge
    }

    // Creating obstacles

    if (clock.getElapsedTime() > 1) {
        clock.start();
        addObstacleRow();
    }
    obstacleBehavior();
}

function setup() {
    createScene();
    animate();
}