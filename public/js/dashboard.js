// Import Firebase Authentication methods
import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js';
import { app } from '/js/auth/config.js';

// Initialize Firebase Auth
const auth = getAuth(app);

// DOM Elements
const userNameElement = document.getElementById('userName');
const welcomeNameElement = document.getElementById('welcomeName');
const userAvatarElement = document.getElementById('userAvatar');
const logoutBtn = document.getElementById('logoutBtn');

// Check authentication state
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('medreach_user') || sessionStorage.getItem('medreach_user'));
    const token = localStorage.getItem('medreach_token') || sessionStorage.getItem('medreach_token');
    
    if (!user || !token) {
        // No user logged in, redirect to login
        window.location.href = '/auth/login.html';
        return;
    }
    
    // Update UI with user data
    updateUserUI(user);
    
    // Load dashboard data
    loadDashboardData();
}

// Update UI with user data
function updateUserUI(user) {
    if (userNameElement) userNameElement.textContent = user.name || 'User';
    if (welcomeNameElement) welcomeNameElement.textContent = user.name || 'User';
    
    // Set user avatar (if available)
    if (user.photoURL) {
        userAvatarElement.src = user.photoURL;
        userAvatarElement.alt = user.name || 'User';
    } else {
        // Use a default avatar with user initials
        const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
        userAvatarElement.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=4e73df&color=fff&size=128`;
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const token = localStorage.getItem('medreach_token') || sessionStorage.getItem('medreach_token');
        
        // In a real app, you would fetch this data from your backend
        // For now, we'll use mock data
        setTimeout(() => {
            // Update stats
            document.getElementById('medicinesCount').textContent = '12';
            document.getElementById('appointmentsCount').textContent = '3';
            document.getElementById('notificationsCount').textContent = '5';
            
            // Update recent activities
            const activities = [
                { id: 1, text: 'You have 3 pending appointments', time: '10 minutes ago' },
                { id: 2, text: 'New medicine added to your list', time: '2 hours ago' },
                { id: 3, text: 'Your profile has been updated', time: '1 day ago' },
                { id: 4, text: 'New health tips available', time: '2 days ago' }
            ];
            
            const activityList = document.getElementById('activityList');
            if (activityList) {
                activityList.innerHTML = activities.map(activity => `
                    <div class="activity-item">
                        <div class="activity-icon">
                            <i class="fas fa-bell"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-text">${activity.text}</div>
                            <div class="activity-time">${activity.time}</div>
                        </div>
                    </div>
                `).join('');
            }
        }, 1000);
        
        // Example of fetching data from your backend
        /*
        const response = await fetch('/api/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load dashboard data');
        }
        
        const data = await response.json();
        // Update the UI with the fetched data
        */
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Show error message to user
    }
}

// Handle logout
async function handleLogout() {
    try {
        await signOut(auth);
        // Clear stored user data
        localStorage.removeItem('medreach_token');
        localStorage.removeItem('medreach_user');
        sessionStorage.removeItem('medreach_token');
        sessionStorage.removeItem('medreach_user');
        
        // Redirect to login page
        window.location.href = '/auth/login.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to log out. Please try again.');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Add this to handle browser back/forward buttons
window.addEventListener('popstate', () => {
    checkAuth();
});
