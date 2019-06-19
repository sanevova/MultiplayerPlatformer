import 'phaser'
import {YungSkryllaScenePreload} from './YungSkryllaScenePreload'
import {loadAnimations} from '../animations_ts'
import {connectAs} from '../client_ts'
import {configureSocketEvents} from '../sockets_ts'
import {Projectile} from '../Projectile_ts'
import {createPlayerFromPlayerData, playerData} from './PlayerUtils'

export class YungSkryllaSceneCreate extends YungSkryllaScenePreload {
    socket: any;
    platforms: Phaser.Physics.Arcade.StaticGroup;
    world = {
        width: window.innerWidth,
        height: window.innerHeight
    };


    constructor(config) {
        super(config);
        if (this.constructor === YungSkryllaSceneCreate) {
            throw new TypeError('Abstract class "YungSkryllaSceneCreate" cannot be instantiated directly.');
        }
    }

    create() {
        console.log('create');

        // map creation
        let bg = this.add.image(this.world.width / 2, this.world.height / 2, 'sky');
        bg.setScale(Math.min(this.world.width / bg.width, this.world.height / bg.height));

        this.platforms = this.physics.add.staticGroup();

        this.platforms.create(100, 528, 'platform').refreshBody();
        this.platforms.create(300, 528, 'platform').refreshBody();
        this.platforms.create(500, 528, 'platform').refreshBody();
        this.platforms.create(700, 528, 'platform').refreshBody();
        this.platforms.create(1000, 628, 'platform').refreshBody();
        this.platforms.create(1400, 828, 'platform').refreshBody();
        this.platforms.create(1200, 998, 'platform').refreshBody();
        this.platforms.create(900, 1100, 'platform').refreshBody();
        for (var i = 0; i < 20; ++i) {
            this.platforms.create(200 * i + 100, this.world.height - 60, 'platform').refreshBody();
        }
        this.platforms.create(600, 370, 'platform').refreshBody();
        this.platforms.create(50, 250, 'platform').refreshBody();
        this.platforms.create(750, 220, 'platform').refreshBody();

        this._createMyPlayer();
        configureSocketEvents(this.socket);

        // animations
        loadAnimations(this);

        this.physics.world.on('worldbounds', function(body) {
            if (body.gameObject instanceof Projectile) {
                body.gameObject.destroy();
            }
        });
    }

    _randname() {
        return Math.random().toString(36).substring(7);
    }

    _createMyPlayer() {
        this.player = createPlayerFromPlayerData(
            this,
            {
                name:  this.getUrlParameter('name') || this._randname(),
                pos: {
                    x: 100,
                    y: 450
                }
            }
        );
        this.players.push(this.player);
        this.socket = connectAs(playerData(this.player));
        return this.player;
    }


    getUrlParameter(name: string): string {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };
}
