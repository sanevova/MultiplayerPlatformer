import {Player} from '../Player_ts'

export enum SpellName {
    SPRINT = 'sprint',
    FIREBALL = 'fireball',
    ICEBALL = 'iceball'
};

export enum SpellTargetType {
    SKILLSHOT_HORIZONTAL,
    SKILLSHOT_TARGET,
    TARGET,
    AREA,
    NONE
}

export enum SpellCastType {
    INSTANT,
    CAST,
    CHANNEL
}

export class Spell {
    caster: Player;
    name: SpellName;
    targetType: SpellTargetType;
    castType: SpellCastType
    cooldown: number;
    castTime: number;
    isOnCooldown: boolean;

    constructor(caster, name, targetType, castType, cooldown, castTime = 0) {
        if (this.constructor === Spell) {
            throw new TypeError('Abstract class "Spell" cannot be instantiated directly.');
        }
        this.caster = caster;
        this.name = name;
        this.targetType = targetType;
        this.castType = castType;
        this.castTime = castTime;
        this.cooldown = cooldown;
        this.isOnCooldown = false;
    }

    cast(): void {
        if (this.isOnCooldown) {
            console.log(`${this.caster.name} cannot cast ${this.name}: ON COOLDOWN!`);
            return;
        }
        this.isOnCooldown = true;
        (function (spell) {
            console.log(`${spell.name} cooldown started: ${spell.cooldown / 1000}s`);
            setTimeout(() => {
                spell.isOnCooldown = false;
                console.log(`${spell.name} off cooldown!`);
            }, spell.cooldown);
        })(this);
        this.castImpl();
    }

    castImpl(): void {
        if (this.constructor === Spell) {
            throw new TypeError('Override "cast" method from abstract class "Spell".');
        }
    }
}
