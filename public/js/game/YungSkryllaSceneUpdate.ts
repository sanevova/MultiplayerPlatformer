import {YungSkryllaSceneCreate} from './YungSkryllaSceneCreate'
import {playerData} from './PlayerUtils'

export class YungSkryllaSceneUpdate extends YungSkryllaSceneCreate {
    tickNumber: number;

    constructor(config) {
        super(config);
        if (this.constructor === YungSkryllaSceneUpdate) {
            throw new TypeError('Abstract class "YungSkryllaSceneUpdate" cannot be instantiated directly.');
        }
        this.tickNumber = 0;
    }

    update(time, delta) {
        let controller = this.controller;
        let cursors = controller.cursors;
        let player = this.player;
        let world = this.world;

        if (controller.keyK.isDown) {
            this.socket.emit('kick_all');
        }

        this.players.map(p => p.update());

        // state
        let airborne = !player.body.touching.down;
        let shouldAnimateMovement = !airborne && !player.isAttacking;

        // movement
        let shouldCrouch = (controller.keyC.isDown || controller.keyS.isDown) && shouldAnimateMovement && !player.isDroppingDown
        let shouldMoveLeft = cursors.left.isDown || controller.keyA.isDown
        let shouldMoveRight = cursors.right.isDown || controller.keyD.isDown;
        let shouldJump = (cursors.up.isDown || controller.keyW.isDown || cursors.space.isDown)
                && !airborne && !this.player.isCrouching && !player.isDroppingDown;
        let shouldSlash = controller.keyQ.isDown;
        let shouldOverhead = controller.keyE.isDown;
        let shouldUppercut = controller.keyR.isDown;
        let shouldBow = controller.keyF.isDown;

        if (shouldMoveLeft && shouldMoveRight) {
            shouldMoveLeft = shouldMoveRight = false;
        }

        // touch contorls
        var pointer = this.input.activePointer;
        if (pointer.isDown) {
            var touchX = pointer.x;
            var touchY = pointer.y;
            if (touchY > world.height / 2) {
                // |       |       |
                // | left  | right |
                shouldMoveRight = touchX > world.width / 2;
                shouldMoveLeft = !shouldMoveRight;
            } else {
                // | slash |  jump |
                // |       |       |
                shouldJump = touchX > world.width / 2  && !airborne;
                shouldSlash = touchX <= world.width / 2;
            }
        }


        if (shouldCrouch && !player.didCrouch) {
            this.socket.emit('on_player_crouch', playerData(player));
        } else if (!shouldCrouch && player.didCrouch) {
            this.socket.emit('on_player_stop_crouch', playerData(player));
        }
        if (shouldMoveLeft && !player.didMoveLeft) {
            this.socket.emit('on_player_moveLeft', playerData(player));
        } else if (!shouldMoveLeft && player.didMoveLeft) {
            this.socket.emit('on_player_stop_moveLeft', playerData(player));
        }
        if (shouldMoveRight && !player.didMoveRight) {
            this.socket.emit('on_player_moveRight', playerData(player));
        } else if (!shouldMoveRight && player.didMoveRight) {
            this.socket.emit('on_player_stop_moveRight', playerData(player));
        }
        if (shouldSlash && !player.isAttacking) {
            this.socket.emit('on_player_attack', playerData(player), 'attack_slash');
        }
        if (shouldOverhead && !player.isAttacking) {
            this.socket.emit('on_player_attack', playerData(player), 'attack_overhead');
        }
        if (shouldUppercut && !player.isAttacking) {
            this.socket.emit('on_player_attack', playerData(player), 'attack_uppercut');
        }
        if (shouldBow && !player.isAttacking) {
            this.socket.emit('on_player_attack', playerData(player), 'attack_bow');
        }

        if (controller.cursors.space.isDown && this.controller.canDropDown && controller.cursors.space.repeats === 1) {
            this.controller.canDropDown = false;
            this.player.tryDropDown();
        } else if (
            !this.player.isDroppingDown
            && !this.controller.canDropDown
            && controller.cursors.space.isUp
        ) {
            this.controller.canDropDown = true;
        }

        if (shouldMoveLeft) {
            player.moveLeft();
        }
        else if (shouldMoveRight) {
            player.moveRight();
        }
        else if (!player.isDroppingDown) {
            player.setVelocityX(0);
            if (shouldAnimateMovement) {
                player.anims.play('idle', true);
            }
        }

        // jump
        if (shouldJump) {
            player.jump();
            this.socket.emit('on_player_jump', playerData(player));
        }

        // crouch
        if (shouldCrouch) {
            player.isCrouching = true;
            player.anims.play('crouch', true);
        } else {
            player.isCrouching = false;
        }

        if (airborne && !player.isAttacking) {
          player.anims.play('jump', true);
        }

        player.bindAttack(shouldSlash, 'attack_slash');
        player.bindAttack(shouldOverhead, 'attack_overhead');
        player.bindAttack(shouldUppercut, 'attack_uppercut');
        player.bindAttack(shouldBow, 'attack_bow' + (player.airborne ? '_jump' : ''));

        this.tickNumber += 1;

        player.didCrouch = shouldCrouch;
        player.didMoveLeft = shouldMoveLeft;
        player.didMoveRight = shouldMoveRight;
        player.didJump = shouldJump;
    }
}
