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
            <div class="current-die p-1 border-2 border-black border-t-0 rounded-b-lg cursor-pointer flex justify-center items-center bg-white hover:bg-gray-50 transition-colors h-16"
                 @click="isOpen = true">
                <img :src="'assets/dice/D' + modelValue + '.png'" :alt="'d' + modelValue" class="h-full object-contain">
                <!-- Chevron -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute bottom-1 right-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            <!-- Modal Overlay -->
            <teleport to="body">
                <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" @click="isOpen = false">
                    <!-- Modal Content -->
                    <div class="bg-white border-3 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full max-w-xs" @click.stop>
                        <h3 class="font-bangers text-2xl text-center mb-4 text-magenta tracking-wide" style="color: var(--color-magenta); text-shadow: 1px 1px 0 #000;">SELECT DIE</h3>
                        <div class="grid grid-cols-3 gap-4 place-items-center">
                            <div v-for="size in [4, 6, 8, 10, 12]"
                                 :key="size"
                                 class="option-die w-16 h-16 p-1 rounded-full border-2 border-transparent hover:border-black hover:bg-yellow-100 cursor-pointer flex justify-center items-center transition-all"
                                 :class="{ 'bg-blue-100 border-black': modelValue === size }"
                                 @click="select(size)">
                                 <img :src="'assets/dice/D' + size + '.png'" :alt="'d' + size" class="w-full h-full object-contain">
                            </div>
                        </div>
                        <div class="mt-4 text-center">
                            <button class="comic-btn text-sm py-1 px-4" @click="isOpen = false">CANCEL</button>
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
