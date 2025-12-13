/**
 * Modal component for editing a Principle.
 * @component
 */
app.component('principle-modal', {
    props: {
        show: Boolean,
        principle: Object,
        principleIndex: Number
    },
    emits: ['save', 'close'],
    data() {
        return {
            name: '',
            overcomeText: ''
        };
    },
    watch: {
        show: {
            handler(newVal) {
                if (newVal && this.principle) {
                    this.name = this.principle.name || '';
                    this.overcomeText = this.principle.overcomeText || '';
                }
            },
            immediate: true
        }
    },
    methods: {
        handleSubmit() {
            this.$emit('save', {
                index: this.principleIndex,
                name: this.name,
                overcomeText: this.overcomeText
            });
            this.$emit('close');
        },
        handleClose() {
            this.$emit('close');
        }
    },
    template: `
        <div class="modal-overlay" v-if="show" @click.self="handleClose">
            <div class="modal-content wobbly-box" style="max-height: 90vh; overflow-y: auto;">
                <h2 class="comic-title">EDIT PRINCIPLE</h2>
                <form @submit.prevent="handleSubmit">
                    <div class="form-group mb-4">
                        <label class="block font-bangers tracking-wide text-lg mb-1">PRINCIPLE NAME</label>
                        <input type="text" v-model="name" class="w-full border-2 border-black p-2 font-comic text-lg rounded" placeholder="Principle of...">
                    </div>

                    <div class="form-group mb-4">
                        <label class="block font-bangers tracking-wide text-lg mb-1">OVERCOME ACTION</label>
                        <textarea v-model="overcomeText" class="w-full border-2 border-black p-2 font-comic text-lg rounded h-24 resize-none" placeholder="Describe the overcome action..."></textarea>
                    </div>

                    <div class="flex gap-2 mt-4">
                        <button type="button" class="comic-btn secondary flex-1" @click="handleClose">CANCEL</button>
                        <button type="submit" class="comic-btn primary flex-1">SAVE</button>
                    </div>
                </form>
            </div>
        </div>
    `
});
