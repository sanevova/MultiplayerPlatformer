import {Player} from '../Player_ts'
import {SpellName} from './Spell'
import {HorizontalProjectile} from './HorizontalProjectile'

export class Iceball extends HorizontalProjectile {
    constructor(caster: Player) {
        super(caster, SpellName.ICEBALL);
    }
}
