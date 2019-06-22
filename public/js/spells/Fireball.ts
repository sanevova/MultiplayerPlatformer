import {Player} from '../Player_ts'
import {SpellName} from './Spell'
import {HorizontalSpell} from './HorizontalSpell'

export class Fireball extends HorizontalSpell {
    constructor(caster: Player) {
        super(caster, SpellName.FIREBALL);
    }
}
