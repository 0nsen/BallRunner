// variables

var animationRequestID;
var gameWidth = 1200;
var gameHeight = 675;

var controls;

var scene;
var camera;
var renderer;

var clock;

var ballColor = "#F5CB5C";
var ballRadius = 5;
var ballDetail = 1;
var ballSpeed = 0;
var ballAcceleration = 0.15;
var ball;

var friction = 0.01;

var sunLight;
var sunLightColor = "#FC6471";

var fogColor = "#F2F7F2";

var hemisphereLight;
var hemisphereLightColorTop = "#B23A48";

var cylinderColor = "#003844";
var cylinderRadius = 200;
var cylinderHeight = 300;
var cylinderRadialSegments = 70;
var cylinderSpeed;
var cylinder;

var columnColor = "#307351";
var columnRadius = 5;
var columnHeight = 20;
var columnRadialSegments = 50;

var columnArray;
var columnAmount = 20;

var obstaclesInSight;

var scoreNumber = 0;
var score = "";

function obstacleBehavior() {
    var obstaclePosition = new THREE.Vector3();

    obstaclesInSight.forEach(obstacle => {
        obstaclePosition.setFromMatrixPosition(obstacle.matrixWorld);

        if (obstaclePosition.z > 20 && obstaclePosition.y < 190) {  // Out of camera vision
            var temp = obstaclesInSight.splice(obstaclesInSight.indexOf(obstacle), 1);  // Remove the obstacle

            columnArray.push(temp[0]); // Recycle the obstacle
            temp.visible = false;
        }
        else {
            if (obstaclePosition.distanceTo(ball.position) < 10) {  // Obstacle touches the ball
                window.cancelAnimationFrame(animationRequestID);    // Stop game
                document.querySelector(".restart").style.visibility = 'visible';    // Show restart button
            }
        }
    });

}

function addObstacleRow() {
    var lanes = [-55, -45, -35, -25, -15, -5, 5, 15, 25, 35, 45, 55];
    var laneIndex = Math.floor(Math.random() * (lanes.length - 1));

    if (columnArray.length <= 0) return;

    var newObstacle = columnArray.pop();
    newObstacle.visible = true;
    obstaclesInSight.push(newObstacle);

    // Place obstacle along the cylinder
    var spherical = new THREE.Spherical(cylinderRadius + (columnHeight/2) - 0.3, 90 * Math.PI/180, cylinder.rotation.x - 3);
    newObstacle.position.setFromSpherical(spherical);

    // Rotate obstacle to stand upright against the cylinder
    var ballVector = ball.position.clone().normalize();
    var obstacleVector = newObstacle.position.clone().normalize();
    newObstacle.quaternion.setFromUnitVectors(obstacleVector, ballVector);

    // Randomize obstacle horizontal placement
    newObstacle.position.y = lanes[laneIndex];
    
    cylinder.add(newObstacle);
}

function createColumn() {   // Create obstacle column
    var columnGeometry = new THREE.CylinderGeometry(columnRadius, columnRadius, columnHeight, columnRadialSegments);
    var columnMaterial = new THREE.MeshStandardMaterial({color: columnColor});

    var column = new THREE.Mesh(columnGeometry, columnMaterial);

    column.castShadow = true;
    column.receiveShadow = true;

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

    ball.position.y = cylinderRadius + ballRadius - 0.7;    // Position ball on the platform

    scene.add(ball);
}

function userInput(keyEvent) {
    if (keyEvent.keyCode == 37) {   // Left
        if (ball.position.x >= -55 && ballSpeed > -2) {
            if (ballSpeed > 0) ballSpeed = -ballSpeed;
            ballSpeed -= ballAcceleration; 
        }
        else ballSpeed = ballSpeed; // Limit max speed
    }
    else if (keyEvent.keyCode == 39) {  // Right
        if (ball.position.x <= 55 && ballSpeed < 2) {
            if (ballSpeed < 0) ballSpeed = -ballSpeed;
            ballSpeed += ballAcceleration; 
        }
        else ballSpeed = ballSpeed; // Limit max speed
    }
}

function createScene(isRestart) {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, gameWidth/gameHeight, 0.1, 1000 );
    camera.rotation.x = -45 * Math.PI/180;
    camera.position.y = 250;
    camera.position.z = 20;
    
    renderer = new THREE.WebGLRenderer({alpha: true});  // Render with transparent background
    renderer.setSize(gameWidth, gameHeight);

    var gameScreen = document.querySelector(".game");
    if (isRestart == 'restart') {
        gameScreen.removeChild(gameScreen.childNodes[0]);
        document.querySelector(".restart").style.visibility = 'hidden';
    }
    gameScreen.appendChild(renderer.domElement);

    renderer.shadowMap.enabled = true;  // Enable shadow map
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //controls = new THREE.OrbitControls(camera, renderer.domElement);
    
    clock = new THREE.Clock();
    clock.start();

    cylinderSpeed = 0.015;
    addPlatform();

    ballSpeed = 0;
    addBall();

    columnArray = [];
    obstaclesInSight = [];
    for (var i = 0; i < columnAmount; i++) {
        columnArray.push(createColumn());
    }

    addLight();

    document.addEventListener("keydown", userInput);
    score = document.querySelector(".score-number");
    scoreNumber = 0;
}

function animate() {
    renderer.render(scene,camera);  // Draw scene
    animationRequestID = window.requestAnimationFrame(animate);  // Loop animate()

    if (scoreNumber > 500) cylinderSpeed = 0.03;
    else if (scoreNumber > 1000) cylinderSpeed = 0.06;
    else if (scoreNumber > 1500) cylinderSpeed = 0.09;
    else if (scoreNumber > 2000) cylinderSpeed = 0.12;

    // Ball and cylinder movement
    
    ball.rotation.x -= cylinderSpeed;   // Ball rotates backwards at the same speed as cylinder rotates forwards
    cylinder.rotation.x += cylinderSpeed;

    ball.position.x += ballSpeed;
    if (ballSpeed > 0) ballSpeed -= friction;
    else ballSpeed += friction;

    if (ball.position.x > 55 || ball.position.x < -55) {
       ballSpeed = -ballSpeed; // Bounce the ball back once it hits the edge
    }

    // Creating obstacles

    if (clock.getElapsedTime() > 0.4) { // Spawn obstacles in intervals
        clock.start();
        addObstacleRow();
    }

    scoreNumber += 1;
    score.innerHTML = scoreNumber;

    obstacleBehavior();

    //controls.update();  // OrbitControls
}

function setup(isRestart) {
    createScene(isRestart);
    animate();
}