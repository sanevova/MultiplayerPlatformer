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

    _addPlatform(x, y) {
        let platform = this.platforms.create(x, y, 'platform').refreshBody();
        platform.setSize(0.9 * platform.width, platform.height);
    }

    create() {
        console.log('create');

        // map creation
        let bg = this.add.image(this.world.width / 2, this.world.height / 2, 'sky');
        bg.setScale(Math.min(this.world.width / bg.width, this.world.height / bg.height));

        this.platforms = this.physics.add.staticGroup();

        this._addPlatform(100, 528);
        this._addPlatform(300, 528);
        this._addPlatform(500, 528);
        this._addPlatform(700, 528);
        this._addPlatform(1000, 628);
        this._addPlatform(1400, 828);
        this._addPlatform(1200, 998);
        this._addPlatform(900, 1100);
        for (var i = 0; i < 20; ++i) {
            this._addPlatform(200 * i + 100, this.world.height - 60);
        }
        this._addPlatform(600, 370);
        this._addPlatform(50, 250);
        this._addPlatform(750, 220);

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
