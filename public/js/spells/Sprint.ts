import {Player, BuffName} from '../Player_ts'
import {Spell, SpellName, SpellTargetType, SpellCastType} from './Spell'

export class Sprint extends Spell {
    static cooldown: number = 30 * 1000; // 30 sec cd
    static buffDuration: number = 10 * 1000; // 10 sec sprint duration

    constructor(caster: Player) {
        super(
            caster,
            SpellName.SPRINT,
            SpellTargetType.NONE,
            SpellCastType.INSTANT,
            Sprint.cooldown,
        );
    }

    castImpl(): void {
        this.caster.setShouldTrace(true);
        this.caster.applyBuff(
            BuffName.SPRINT,
            Sprint.buffDuration,
            (caster) => (caster.setShouldTrace(false))
        );
    }
}
