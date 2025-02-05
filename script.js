// List of 50 sensitive zones (hospitals & schools) in Coimbatore
const sensitiveZones = [
    { name: "PSG Hospitals", lat: 11.0183, lng: 76.9740, type: "hospital" },
    { name: "Coimbatore Medical College Hospital", lat: 11.0183, lng: 76.9662, type: "hospital" },
    { name: "Ganga Hospital", lat: 11.0104, lng: 76.9616, type: "hospital" },
    { name: "KG Hospital", lat: 11.0027, lng: 76.9663, type: "hospital" },
    { name: "Aravind Eye Hospital", lat: 11.0168, lng: 76.9558, type: "hospital" },
    { name: "Sri Ramakrishna Hospital", lat: 11.0106, lng: 76.9699, type: "hospital" },
    { name: "Kovai Medical Center and Hospital", lat: 11.0536, lng: 77.0186, type: "hospital" },
    { name: "Lotus Eye Hospital", lat: 11.0185, lng: 76.9693, type: "hospital" },
    { name: "Sankara Eye Hospital", lat: 10.9986, lng: 76.9820, type: "hospital" },
    { name: "The Eye Foundation", lat: 11.0165, lng: 76.9690, type: "hospital" },
    { name: "Stanes Higher Secondary School", lat: 11.0006, lng: 76.9665, type: "school" },
    { name: "Avila Convent Matriculation Higher Secondary School", lat: 11.0182, lng: 76.9557, type: "school" },
    { name: "PSG Public Schools", lat: 11.0183, lng: 76.9740, type: "school" },
    { name: "Kendriya Vidyalaya", lat: 11.0183, lng: 76.9662, type: "school" },
    { name: "Chinmaya Vidyalaya", lat: 11.0104, lng: 76.9616, type: "school" },
    { name: "Delhi Public School", lat: 11.0027, lng: 76.9663, type: "school" },
    { name: "Suguna Pip School", lat: 11.0168, lng: 76.9558, type: "school" },
    { name: "CS Academy", lat: 11.0106, lng: 76.9699, type: "school" },
    { name: "SSVM World School", lat: 11.0536, lng: 77.0186, type: "school" },
    { name: "Yuvabharathi Public School", lat: 11.0185, lng: 76.9693, type: "school" }
];

// List of roads with latitude, longitude, and speed limits in Coimbatore
const roads = [
    { road: "Avinashi Road", lat: 11.0183, lng: 76.9740, speedLimit: 60 },
    { road: "Trichy Road", lat: 10.9986, lng: 76.9820, speedLimit: 50 },
    { road: "Thadagam Road", lat: 11.0249, lng: 76.9346, speedLimit: 40 },
    { road: "Mettupalayam Road", lat: 11.0545, lng: 76.9715, speedLimit: 50 },
    { road: "Sathyamangalam Road", lat: 11.0845, lng: 76.9488, speedLimit: 60 },
    { road: "Pollachi Road", lat: 10.9200, lng: 76.9640, speedLimit: 50 },
    { road: "Palakkad Road", lat: 10.9920, lng: 76.9500, speedLimit: 50 },
    { road: "Vilankurichi Road", lat: 11.0700, lng: 77.0000, speedLimit: 40 },
    { road: "Singanallur Road", lat: 10.9980, lng: 76.9800, speedLimit: 50 },
    { road: "Ukkadam Bypass Road", lat: 10.9900, lng: 76.9500, speedLimit: 60 }
];

// Function to calculate distance between two coordinates
function getDistance(lat1, lng1, lat2, lng2) {
    let R = 6371; // Radius of the Earth in km
    let dLat = (lat2 - lat1) * (Math.PI / 180);
    let dLng = (lng2 - lng1) * (Math.PI / 180);
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Function to play audio alerts
function playAudioAlert(file) {
    let audioContainer = document.getElementById("audio-container");
    audioContainer.innerHTML = ""; // Remove previous audio
    let audio = document.createElement("audio");
    audio.src = file;
    audio.controls = true;
    audio.autoplay = true;
    audioContainer.appendChild(audio);
}

// Function to check if the user is in a sensitive zone
function checkSensitiveZone(lat, lng) {
    for (let zone of sensitiveZones) {
        let distance = getDistance(lat, lng, zone.lat, zone.lng);
        if (distance < 0.5) { // If within 500 meters
            if (zone.type === "hospital") {
                playAudioAlert("no_horn.mp3");
                document.getElementById("alert").textContent = "No Horn!";
            } else if (zone.type === "school") {
                playAudioAlert("go_slow.mp3");
                document.getElementById("alert").textContent = "Slow Down!";
            }
        }
    }
}

// Function to check if the user is overspeeding
function checkSpeedLimit(currentSpeed, roadInfo) {
    if (currentSpeed > roadInfo.speedLimit) {
        playAudioAlert("go_slow.mp3");
        document.getElementById("alert").textContent = "Slow Down! You are exceeding the speed limit.";
    } else {
        document.getElementById("alert").textContent = `You are within the speed limit of ${roadInfo.speedLimit} km/h on ${roadInfo.road}`;
    }
}

// Function to get the nearest road based on user's location
function getRoadFromCoordinates(lat, lng) {
    let closestRoad = "Unknown";
    let minDistance = Infinity;
    let speedLimit = 0;

    for (let road of roads) {
        let distance = getDistance(lat, lng, road.lat, road.lng);
        if (distance < minDistance) {
            minDistance = distance;
            closestRoad = road.road;
            speedLimit = road.speedLimit; // Get speed limit for the closest road
        }
    }

    return minDistance < 0.5 ? { road: closestRoad, speedLimit: speedLimit } : { road: "Unknown", speedLimit: 0 };
}

// Real-time GPS tracking to detect roads, speed limits, and provide alerts
navigator.geolocation.watchPosition(
    (position) => {
        let userLat = position.coords.latitude;
        let userLng = position.coords.longitude;
        let currentSpeed = position.coords.speed ? position.coords.speed * 3.6 : 0; // Convert m/s to km/h
        let roadInfo = getRoadFromCoordinates(userLat, userLng);

        document.getElementById("speed").textContent = currentSpeed.toFixed(2);
        document.getElementById("road").textContent = roadInfo.road;

        // Alert user if they exceed the speed limit
        checkSpeedLimit(currentSpeed, roadInfo);

        // Check for sensitive zone proximity
        checkSensitiveZone(userLat, userLng);
    },
    (error) => {
        console.error("Error getting location:", error);
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
);
