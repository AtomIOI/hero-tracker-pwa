app.component('ability-card', {
    props: ['ability'],
    template: `
        <div class="ability-card" :class="['bg-' + ability.zone]">
            <div class="ability-card-content">
                <div class="ability-card-header">
                    <h2>{{ ability.name }}</h2>
                </div>
                <div class="ability-card-body">
                    <p>{{ ability.text }}</p>
                </div>
            </div>
            <div class="ability-card-actions">
                <button class="comic-btn" @click="$emit('edit', ability)">Edit</button>
            </div>
        </div>
    `
});