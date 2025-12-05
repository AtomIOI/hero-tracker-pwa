/**
 * Component for adding or editing a trait (Power or Quality).
 * @component
 */
app.component('add-edit-trait-modal', {
    props: {
        /**
         * The trait to edit (if any). Null for adding.
         * @type {Object|null}
         */
        trait: Object,
        /**
         * The type of trait ('Power' or 'Quality').
         * @type {string}
         */
        type: String,
        /**
         * Whether the modal is visible.
         * @type {boolean}
         */
        show: Boolean
    },
    data() {
        return {
            /** @type {string} ID of the trait */
            id: '',
            /** @type {string} Name of the trait */
            name: '',
            /** @type {number} Die size (e.g., 4, 6, 8, 10, 12) */
            die: 6
        };
    },
    watch: {
        /**
         * Watcher for the 'trait' prop to populate form data on edit.
         * @param {Object|null} newVal - The new trait object or null.
         */
        trait: {
            handler(newVal) {
                if (newVal) {
                    this.id = newVal.id;
                    this.name = newVal.name;
                    this.die = newVal.die;
                } else {
                    this.id = '';
                    this.name = '';
                    this.die = 6;
                }
            },
            immediate: true
        },
        /**
         * Watcher for the 'show' prop to reset form data when the modal opens for a new trait.
         * @param {boolean} newVal - Whether the modal is shown.
         */
        show(newVal) {
            if (newVal && !this.trait) {
                this.id = '';
                this.name = '';
                this.die = 6;
            } else if (newVal && this.trait) {
                // Ensure data is synced when opening in edit mode as well, just in case
                this.id = this.trait.id;
                this.name = this.trait.name;
                this.die = this.trait.die;
            }
        }
    },
    template: `
        <div class="modal-overlay" v-if="show">
            <div class="modal-content wobbly-box comic-modal-panel">
                <h2 class="comic-title">{{ trait ? 'Edit' : 'Add' }} {{ type }}</h2>
                <form @submit.prevent="handleSubmit">

                    <div class="comic-input-group">
                        <label for="trait-name" class="comic-label-box">Name</label>
                        <input type="text" id="trait-name" v-model="name" required class="comic-input-box">
                    </div>

                    <div class="comic-input-group">
                        <label class="comic-label-box">Die Rating</label>
                        <div class="comic-input-box dice-selector-container">
                            <div class="dice-selector">
                                <div v-for="size in [4, 6, 8, 10, 12]"
                                     :key="size"
                                     class="form-die-option"
                                     :class="{ selected: die === size }"
                                     @click="die = size">
                                    <img :src="'assets/dice/D' + size + '.png'" :alt="'d' + size" class="trait-die-icon">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="comic-btn" @click="$emit('close')">Cancel</button>
                        <button v-if="trait" type="button" class="comic-btn minus" @click="handleDelete">Delete</button>
                        <button type="submit" class="comic-btn plus">{{ trait ? 'Save' : 'Add' }}</button>
                    </div>
                </form>
            </div>
        </div>
    `,
    methods: {
        /**
         * Emits the 'save' event with the trait data.
         */
        handleSubmit() {
            this.$emit('save', {
                id: this.id,
                name: this.name,
                die: this.die
            });
        },
        /**
         * Emits the 'delete' event for the current trait.
         */
        handleDelete() {
            this.$emit('delete', { id: this.id });
            this.$emit('close');
        }
    }
});
