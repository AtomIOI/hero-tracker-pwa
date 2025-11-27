app.component('ability-card', {
    props: ['ability'],
    template: `
        <div class="ability-card" :class="['bg-' + ability.zone]">
            <div class="ability-card-header">
                <h3>{{ ability.name }}</h3>
            </div>
            <div class="ability-card-body bg-dots">
                <p>{{ ability.text }}</p>
            </div>
            <div class="ability-card-footer">
                <button class="comic-btn" @click="$emit('edit', ability)">EDIT</button>
            </div>
        </div>
    `
});
