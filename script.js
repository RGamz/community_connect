// Mobile menu toggle
        document.getElementById('mobile-menu-button').addEventListener('click', function() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
        });

        // Modal functionality
        const modal = document.getElementById('add-profile-modal');
        const openFormBtns = document.querySelectorAll('#open-form-btn, #open-form-btn-2');
        const closeModalBtn = document.getElementById('close-modal');
        const cancelFormBtn = document.getElementById('cancel-form');
        
        openFormBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                initLocationMap();
            });
        });
        
        [closeModalBtn, cancelFormBtn].forEach(btn => {
            btn.addEventListener('click', function() {
                modal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            });
        });

        // Image preview
        const photoInput = document.getElementById('photo');
        const profileImagePreview = document.getElementById('profile-image-preview');
        const fileNameSpan = document.getElementById('file-name');
        
        photoInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    profileImagePreview.src = e.target.result;
                    profileImagePreview.style.display = 'block';
                }
                reader.readAsDataURL(this.files[0]);
                fileNameSpan.textContent = this.files[0].name;
            }
        });

        // Initialize main map
        let map;
        let markers = [];
        let locationMap; // For the modal's location selection map
        
        function initMainMap() {
            map = L.map('map').setView([51.505, -0.09], 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            // Add some sample markers (in a real app, these would come from a database)
            addSampleProfiles();
            
            // Locate me button
            document.getElementById('locate-me-btn').addEventListener('click', function() {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        map.setView([position.coords.latitude, position.coords.longitude], 13);
                    }, function() {
                        alert('Could not get your location. Please make sure location services are enabled.');
                    });
                } else {
                    alert('Geolocation is not supported by your browser.');
                }
            });
            
            // Search functionality
            document.getElementById('search-btn').addEventListener('click', searchLocation);
            document.getElementById('search-location').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchLocation();
                }
            });
        }
        
        function initLocationMap() {
            if (!locationMap) {
                locationMap = L.map('location-map').setView([51.505, -0.09], 13);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(locationMap);
                
                // Add click event to set location
                locationMap.on('click', function(e) {
                    document.getElementById('latitude').value = e.latlng.lat;
                    document.getElementById('longitude').value = e.latlng.lng;
                    
                    // Clear existing markers
                    locationMap.eachLayer(function(layer) {
                        if (layer instanceof L.Marker) {
                            locationMap.removeLayer(layer);
                        }
                    });
                    
                    // Add new marker
                    L.marker(e.latlng).addTo(locationMap)
                        .bindPopup("Selected location").openPopup();
                });
                
                // Use current location button
                document.getElementById('use-current-location').addEventListener('click', function() {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(function(position) {
                            const lat = position.coords.latitude;
                            const lng = position.coords.longitude;
                            
                            document.getElementById('latitude').value = lat;
                            document.getElementById('longitude').value = lng;
                            
                            locationMap.setView([lat, lng], 15);
                            
                            // Clear existing markers
                            locationMap.eachLayer(function(layer) {
                                if (layer instanceof L.Marker) {
                                    locationMap.removeLayer(layer);
                                }
                            });
                            
                            // Add new marker
                            L.marker([lat, lng]).addTo(locationMap)
                                .bindPopup("Your current location").openPopup();
                        }, function() {
                            alert('Could not get your location. Please make sure location services are enabled.');
                        });
                    } else {
                        alert('Geolocation is not supported by your browser.');
                    }
                });
                
                // Location search in modal
                document.getElementById('location-search').addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        searchLocationInModal();
                    }
                });
            }
        }
        
        function searchLocation() {
            const query = document.getElementById('search-location').value;
            if (!query) return;
            
            // In a real app, you would use a geocoding service like Nominatim
            // This is a simplified version for demonstration
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const lat = parseFloat(data[0].lat);
                        const lon = parseFloat(data[0].lon);
                        map.setView([lat, lon], 13);
                    } else {
                        alert('Location not found. Please try a different search term.');
                    }
                })
                .catch(() => {
                    alert('Error searching for location. Please try again.');
                });
        }
        
        function searchLocationInModal() {
            const query = document.getElementById('location-search').value;
            if (!query) return;
            
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const lat = parseFloat(data[0].lat);
                        const lon = parseFloat(data[0].lon);
                        
                        document.getElementById('latitude').value = lat;
                        document.getElementById('longitude').value = lon;
                        
                        locationMap.setView([lat, lon], 13);
                        
                        // Clear existing markers
                        locationMap.eachLayer(function(layer) {
                            if (layer instanceof L.Marker) {
                                locationMap.removeLayer(layer);
                            }
                        });
                        
                        // Add new marker
                        L.marker([lat, lon]).addTo(locationMap)
                            .bindPopup("Selected location").openPopup();
                    } else {
                        alert('Location not found. Please try a different search term.');
                    }
                })
                .catch(() => {
                    alert('Error searching for location. Please try again.');
                });
        }
        
        function addSampleProfiles() {
            const sampleProfiles = [
                {
                    id: 1,
                    firstName: "John",
                    lastName: "Doe",
                    description: "Former construction worker with 10+ years of experience. Currently homeless after workplace injury.",
                    skills: "carpentry, painting, general labor",
                    needs: "medical attention, warm clothing",
                    lat: 51.505,
                    lng: -0.09,
                    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
                },
                {
                    id: 2,
                    firstName: "Maria",
                    lastName: "Garcia",
                    description: "Experienced cook looking for work. Can prepare meals for events or restaurants.",
                    skills: "cooking, food preparation, cleaning",
                    needs: "shelter, cooking equipment",
                    lat: 51.51,
                    lng: -0.1,
                    photo: "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
                },
                {
                    id: 3,
                    firstName: "Robert",
                    lastName: "Johnson",
                    description: "Skilled gardener and landscaper. Willing to work for food or shelter.",
                    skills: "gardening, landscaping, plant care",
                    needs: "gardening tools, work boots",
                    lat: 51.515,
                    lng: -0.08,
                    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
                }
            ];
            
            // Clear existing markers
            markers.forEach(marker => map.removeLayer(marker));
            markers = [];
            
            // Add markers to map
            sampleProfiles.forEach(profile => {
                const marker = L.marker([profile.lat, profile.lng]).addTo(map);
                
                // Create popup content
                const popupContent = document.createElement('div');
                popupContent.className = 'marker-popup';
                popupContent.innerHTML = `
                    <div class="popup-content">
                        <img src="${profile.photo}" alt="${profile.firstName} ${profile.lastName}">
                        <div class="popup-details">
                            <h4 class="font-bold">${profile.firstName} ${profile.lastName}</h4>
                            <p class="text-sm">${profile.description}</p>
                            <div class="mt-2">
                                ${profile.skills.split(',').map(skill => `<span class="skill-tag">${skill.trim()}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                `;
                
                marker.bindPopup(popupContent);
                markers.push(marker);
            });
            
            // Display profiles in the list
            const profilesContainer = document.getElementById('profiles-container');
            profilesContainer.innerHTML = '';
            
            sampleProfiles.forEach(profile => {
                const profileCard = document.createElement('div');
                profileCard.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300';
                profileCard.innerHTML = `
                    <div class="p-4">
                        <div class="flex items-start">
                            <img src="${profile.photo}" alt="${profile.firstName} ${profile.lastName}" class="w-16 h-16 rounded-full object-cover mr-4">
                            <div>
                                <h3 class="font-bold text-lg">${profile.firstName} ${profile.lastName}</h3>
                                <p class="text-gray-600 text-sm">${profile.description}</p>
                            </div>
                        </div>
                        <div class="mt-4">
                            <h4 class="font-semibold text-sm">Skills:</h4>
                            <div class="mt-1">
                                ${profile.skills.split(',').map(skill => `<span class="skill-tag">${skill.trim()}</span>`).join('')}
                            </div>
                        </div>
                        <div class="mt-4">
                            <h4 class="font-semibold text-sm">Needs:</h4>
                            <p class="text-gray-600 text-sm">${profile.needs}</p>
                        </div>
                        <div class="mt-4 flex justify-between items-center">
                            <button class="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                                <i class="fas fa-map-marker-alt mr-1"></i> View on Map
                            </button>
                            <button class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                                <i class="fas fa-hand-holding-heart mr-1"></i> Help
                            </button>
                        </div>
                    </div>
                `;
                
                profilesContainer.appendChild(profileCard);
            });
        }
        
        // Form submission
        document.getElementById('profile-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const email = document.getElementById('email').value;
            const description = document.getElementById('description').value;
            const skills = document.getElementById('skills').value;
            const needs = document.getElementById('needs').value;
            const lat = document.getElementById('latitude').value;
            const lng = document.getElementById('longitude').value;
            
            // In a real app, you would send this data to a server
            // For this demo, we'll just show an alert
            alert(`Profile for ${firstName} ${lastName} has been submitted successfully!\n\nWe'll now add them to our map to help connect them with opportunities.`);
            
            // Close modal
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            
            // Reset form
            this.reset();
            profileImagePreview.style.display = 'none';
            fileNameSpan.textContent = 'No file chosen';
        });
        
        // Initialize the main map when the page loads
        window.addEventListener('load', initMainMap);