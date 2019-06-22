import {Player, BuffName} from '../Player_ts'
import {BallSpellProjectile} from '../objects/BallSpellProjectile'
import {Spell, SpellName, SpellTargetType, SpellCastType} from './Spell'

export class HorizontalSpell extends Spell {
    static cooldown: number = 5 * 1000; // 5 sec default cd
    static castTime: number = 1 * 1000; // 1 sec default cast time

    constructor(caster: Player, name: SpellName) {
        super(
            caster,
            name,
            SpellTargetType.SKILLSHOT_HORIZONTAL,
            SpellCastType.INSTANT,
            HorizontalSpell.cooldown,
            HorizontalSpell.castTime
        );
        if (this.constructor === HorizontalSpell) {
            throw new TypeError('Abstract class "HorizontalSpell" cannot be instantiated directly.');
        }
    }

    castImpl(): void {
        var projectile = new BallSpellProjectile(
            // @ts-ignore
            this.caster.scene,
            this.caster, // creator
            this.name, // texture
            this.name // type
        );
    }
}
