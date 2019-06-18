import {Player, BuffName} from '../Player_ts'
import {Projectile} from '../Projectile_ts'
import {Spell, SpellName, SpellTargetType, SpellCastType} from './Spell'

export class HorizontalProjectile extends Spell {
    static cooldown: number = 5 * 1000; // 5 sec default cd
    static castTime: number = 1 * 1000; // 1 sec default cast time

    constructor(caster: Player, name: SpellName) {
        super(
            caster,
            name,
            SpellTargetType.SKILLSHOT_HORIZONTAL,
            SpellCastType.INSTANT,
            HorizontalProjectile.cooldown,
            HorizontalProjectile.castTime
        );
        if (this.constructor === HorizontalProjectile) {
            throw new TypeError('Abstract class "HorizontalProjectile" cannot be instantiated directly.');
        }
    }

    cast(): void {
        var projectile = new Projectile(
            // @ts-ignore
            this.caster.scene,
            this.caster, // creator
            this.name, // texture
            this.name // type
        );
    }
}
