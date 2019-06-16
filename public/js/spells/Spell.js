const SPELL_TYPES {
    BUFF = 'buff',
    PROJECTILE = 'projectile'
};

class Spell {
    constructor(name, type, cooldown) {
        if (this.constructor === Spell) {
            throw new TypeError('Abstract class "Spell" cannot be instantiated directly.'); 
        }


    }
}
