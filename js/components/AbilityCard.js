app.component('ability-card', {
    props: ['ability'],
    emits: ['edit'],
    data() {
        return {
            longPressTimer: null,
            isLongPress: false
        };
    },
    methods: {
        startLongPress() {
            this.isLongPress = false;
            this.longPressTimer = setTimeout(() => {
                this.isLongPress = true;
                this.$emit('edit', this.ability);
            }, 600);
        },
        cancelLongPress() {
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
        }
    },
    template: `
        <div class="ability-card no-select"
             :class="['bg-' + ability.zone]"
             @mousedown="startLongPress"
             @touchstart="startLongPress"
             @mouseup="cancelLongPress"
             @touchend="cancelLongPress"
             @mouseleave="cancelLongPress"
             @contextmenu.prevent>
            <div class="ability-card-header pattern-dots">
                <h3>{{ ability.name }}</h3>
            </div>
            <div class="ability-card-body">
                <p>{{ ability.text }}</p>
            </div>
        </div>
    `
});
