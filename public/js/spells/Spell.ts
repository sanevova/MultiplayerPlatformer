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
    }

    cast(): void {
        if (this.constructor === Spell) {
            throw new TypeError('Override "cast" method from abstract class "Spell".');
        }
    }
}
