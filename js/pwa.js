// PWA registration and utilities
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
    }

    // Register service worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('sw.js');
                console.log('Service Worker registered:', registration);
                return registration;
            } catch (error) {
                console.error('Service Worker registration failed:', error);
                return null;
            }
        }
        return null;
    }

    // Setup install prompt
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.hideInstallButton();
            console.log('PWA installed successfully');
        });
    }

    // Show install button
    showInstallButton() {
        const installBtn = document.getElementById('install-button');
        if (installBtn) {
            installBtn.style.display = 'block';
        }
    }

    // Hide install button
    hideInstallButton() {
        const installBtn = document.getElementById('install-button');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }

    // Prompt install
    async promptInstall() {
        if (!this.deferredPrompt) {
            console.log('Install prompt not available');
            return false;
        }

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);

        this.deferredPrompt = null;
        return outcome === 'accepted';
    }

    // Haptic feedback (if supported)
    vibrate(pattern = 50) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    // Screen wake lock
    async requestWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                const wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake lock activated');
                return wakeLock;
            } catch (error) {
                console.error('Wake lock failed:', error);
                return null;
            }
        }
        return null;
    }

    // Web Share API
    async shareData(data) {
        if (navigator.share) {
            try {
                await navigator.share(data);
                return true;
            } catch (error) {
                console.error('Share failed:', error);
                return false;
            }
        }
        return false;
    }
}

export default PWAManager;
