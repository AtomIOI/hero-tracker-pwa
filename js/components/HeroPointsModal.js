app.component('hero-points-modal', {
    props: {
        hero: Object,
        show: Boolean
    },
    emits: ['close'],
    methods: {
        close() {
            this.$emit('close');
        },
        changePoints(amount) {
            const current = this.hero.heroPoints.current;
            const max = this.hero.heroPoints.max || 5;
            let newVal = current + amount;

            if (newVal < 0) newVal = 0;
            // The prompt says "add or subtract", user might want to go above max?
            // Usually hero points are capped. app.js says max: 5.
            // I'll stick to app.js logic which is clamped 0 to max.
            // Wait, app.js changeHeroPoints does clamp.
            // I will implement clamping here too to be safe/responsive.
            if (newVal > max) newVal = max;

            this.hero.heroPoints.current = newVal;
        }
    },
    template: `
        <teleport to="body">
            <div v-if="show" class="modal-overlay" @click.self="close">
                <div class="modal-content wobbly-box bg-white relative text-center p-8" style="max-width: 300px;">
                    <div class="comic-header-box mb-6 comic-header-yellow">
                        <h2 class="comic-title text-2xl m-0">HERO POINTS</h2>
                    </div>

                    <div class="flex items-center justify-center gap-6 mb-8">
                        <button class="comic-btn minus" @click="changePoints(-1)" style="width: 50px; height: 50px; font-size: 2rem;">-</button>

                        <div class="font-bangers text-6xl relative z-10" style="text-shadow: 3px 3px 0px var(--comic-yellow); -webkit-text-stroke: 2px black; color: black;">
                            {{ hero.heroPoints.current }}
                        </div>

                        <button class="comic-btn plus" @click="changePoints(1)" style="width: 50px; height: 50px; font-size: 2rem;">+</button>
                    </div>

                    <button class="comic-btn primary w-full" @click="close">DONE</button>
                </div>
            </div>
        </teleport>
    `
});
