app.component('dice-select', {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    data() {
        return {
            isOpen: false
        };
    },
    template: `
        <div class="dice-select-container">
            <!-- Current Value Display -->
            <div class="current-die" @click="isOpen = true">
                <img :src="'assets/dice/D' + modelValue + '.png'" :alt="'d' + modelValue">
                <!-- Chevron -->
                <svg xmlns="http://www.w3.org/2000/svg" class="chevron-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            <!-- Modal Overlay -->
            <teleport to="body">
                <div v-if="isOpen" class="dice-select-modal-overlay" @click="isOpen = false">
                    <!-- Modal Content -->
                    <div class="dice-select-modal" @click.stop>
                        <h3 class="dice-select-title">SELECT DIE</h3>
                        <div class="dice-options-grid">
                            <div v-for="size in [4, 6, 8, 10, 12]"
                                 :key="size"
                                 class="option-die"
                                 :class="{ 'selected': modelValue === size }"
                                 @click="select(size)">
                                 <img :src="'assets/dice/D' + size + '.png'" :alt="'d' + size">
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button class="comic-btn modal-cancel-btn" @click="isOpen = false">CANCEL</button>
                        </div>
                    </div>
                </div>
            </teleport>
        </div>
    `,
    methods: {
        select(size) {
            this.$emit('update:modelValue', size);
            this.isOpen = false;
        }
    }
});
