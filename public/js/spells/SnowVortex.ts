import {Player} from '../Player_ts'
import {SpellName} from './Spell'
import {VortexSpell} from './VortexSpell'

export class SnowVortex extends VortexSpell {
    constructor(caster: Player) {
        super(caster, SpellName.SNOW_VORTEX);
    }
}
