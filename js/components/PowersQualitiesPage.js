/**
 * Component representing the Powers/Qualities Page.
 * Displays lists of powers and qualities, allowing addition, editing, and deletion.
 * @component
 */
app.component('powers-qualities-page', {
    props: {
        /**
         * The hero object containing powers and qualities.
         * @type {Object}
         */
        hero: Object
    },
    data() {
        return {
            /** @type {string} Currently active tab ('powers' or 'qualities') */
            activeTab: 'powers', // 'powers' or 'qualities'
            /** @type {boolean} Whether the add/edit modal is visible */
            showModal: false,
            /** @type {Object|null} The trait being edited, or null for new */
            editingTrait: null
        };
    },
    computed: {
        /**
         * Returns the list of traits for the active tab.
         * @returns {Array<Object>} List of powers or qualities.
         */
        displayedTraits() {
            return this.activeTab === 'powers' ? this.hero.powers : this.hero.qualities;
        },
        /**
         * Returns the label for the current trait type.
         * @returns {string} 'Power' or 'Quality'.
         */
        currentTypeLabel() {
            return this.activeTab === 'powers' ? 'Power' : 'Quality';
        },
        /**
         * Returns the dynamic header title based on active tab.
         * @returns {string} 'POWERS' or 'QUALITIES'.
         */
        headerTitle() {
            return this.activeTab === 'powers' ? 'POWERS' : 'QUALITIES';
        },
        /**
         * Returns the appropriate class for the header based on active tab.
         * @returns {string} CSS class for the header background.
         */
        headerClass() {
             // Powers = Yellow, Qualities = Purple
             return this.activeTab === 'powers' ? 'comic-header-yellow' : 'comic-header-purple';
        },
        /**
         * Returns the appropriate class for the trait type.
         * @returns {string} 'power' or 'quality'.
         */
        traitTypeClass() {
             return this.activeTab === 'powers' ? 'power' : 'quality';
        }
    },
    template: `
        <div class="powers-qualities-container pb-nav">
            <div class="comic-header-box" :class="headerClass">
                <h1 class="comic-title">{{ headerTitle }}</h1>
            </div>

            <div class="tabs-container">
                <button
                    class="comic-tab tab-powers"
                    :class="{ active: activeTab === 'powers' }"
                    @click="activeTab = 'powers'">
                    POWERS
                </button>
                <button
                    class="comic-tab tab-qualities"
                    :class="{ active: activeTab === 'qualities' }"
                    @click="activeTab = 'qualities'">
                    QUALITIES
                </button>
            </div>

            <button class="comic-btn plus purple add-trait-btn" @click="openAddModal">
                Add New {{ currentTypeLabel }}
            </button>

            <div class="traits-list">
                <div
                    v-for="trait in displayedTraits"
                    :key="trait.id"
                    class="trait-panel"
                    :class="traitTypeClass"
                    @click="openEditModal(trait)"
                >
                    <div class="trait-name">{{ trait.name }}</div>
                    <div class="trait-die-wrapper">
                         <div class="starburst"></div>
                        <img :src="getDieImage(trait.die)" :alt="'d' + trait.die" class="trait-die-icon" />
                    </div>
                </div>
            </div>

            <add-edit-trait-modal
                :show="showModal"
                :trait="editingTrait"
                :type="currentTypeLabel"
                @close="closeModal"
                @save="saveTrait"
                @delete="deleteTrait"
            ></add-edit-trait-modal>
        </div>
    `,
    methods: {
        /**
         * Generates the image path for a die rating.
         * Handles normalization of 'd8' vs '8'.
         * @param {string|number} die - The die rating.
         * @returns {string} Path to the die image.
         */
        getDieImage(die) {
            if (!die) return '';
            // Ensure string, remove 'd' prefix if present, then uppercase 'D'
            const dieStr = String(die).toLowerCase().replace('d', '');
            return `assets/dice/D${dieStr}.png`;
        },
        /**
         * Opens the modal for adding a new trait.
         */
        openAddModal() {
            this.editingTrait = null;
            this.showModal = true;
        },
        /**
         * Opens the modal for editing an existing trait.
         * @param {Object} trait - The trait to edit.
         */
        openEditModal(trait) {
            this.editingTrait = trait;
            this.showModal = true;
        },
        /**
         * Closes the modal.
         */
        closeModal() {
            this.showModal = false;
        },
        /**
         * Saves a trait (add or update).
         * @param {Object} traitData - The trait data to save.
         */
        saveTrait(traitData) {
            const list = this.activeTab === 'powers' ? this.hero.powers : this.hero.qualities;
            const { id, name, die } = traitData;

            if (id) {
                // Editing existing
                const index = list.findIndex(t => t.id === id);
                if (index > -1) {
                    // Update in place to maintain reactivity if needed, or splice
                    list.splice(index, 1, { id, name, die });
                }
            } else {
                // Adding new
                const newId = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
                list.push({ id: newId, name, die });
            }
            this.closeModal();
            this.$root.saveCharacterSheet(); // Ensure persistence
        },
        /**
         * Deletes a trait.
         * @param {Object} traitIdentifier - Object containing the ID of the trait to delete.
         */
        deleteTrait(traitIdentifier) {
            const list = this.activeTab === 'powers' ? this.hero.powers : this.hero.qualities;
            const index = list.findIndex(t => t.id === traitIdentifier.id);
            if (index > -1) {
                list.splice(index, 1);
            }
            this.$root.saveCharacterSheet(); // Ensure persistence
        }
    }
});