import {Player} from '../Player_ts'
import {Vortex} from '../objects/Vortex'
import {Spell, SpellName, SpellTargetType, SpellCastType} from './Spell'

export class VortexSpell extends Spell {
    static cooldown: number = 10 * 1000; // 10 sec default cd
    static castTime: number = 1 * 1000; // 1 sec default cast time

    constructor(caster: Player, name: SpellName) {
        super(
            caster,
            name,
            SpellTargetType.AREA,
            SpellCastType.INSTANT,
            VortexSpell.cooldown,
            VortexSpell.castTime
        );
        if (this.constructor === VortexSpell) {
            throw new TypeError('Abstract class "VortexSpell" cannot be instantiated directly.');
        }
    }

    castImpl(targetData) {
        new Vortex(
            this.caster.scene,
            this.caster,
            targetData.x,
            targetData.y,
            this.name
        );
    }
}
