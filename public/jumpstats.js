// random name tries to set max score (count)
function trySetMaxJumps(name, count) {
    console.log('got jumps for max', name, count);
    if (player.shouldTrackStats && name === player.name && count > player.jumpScore) {
        player.jumpScore = count;
    }
    if (count > hiScore.count) {
        console.log('INSIDEW', count, hiScore.count);
        hiScore = {
            name: name,
            count: count
        };
    }
    updateLabels();
}

function pollMaxJumps() {
    console.log('polling');
    console.log('polling max');
    readMax(trySetMaxJumps);
    if (player.shouldTrackStats) {
        console.log('polling', name);
        read(player.name, trySetMaxJumps);
    }
}

function jumpStats() {
    // < 0 but accounting for float error
    if (player.body.velocity.y < -5) {
        // TODO: add proper listener and do eventName.stopImmediatePropagation();
        // istead of this garbage
        console.log('already started jumping');
        return;
    }
    console.log('jumping');
    // stats
    if (player.shouldTrackStats) {
        // bump jump count
        read(player.name, (name, count) => {
            player.jumpScore = count + 1;
            write(name, player.jumpScore);
            trySetMaxJumps(name, player.jumpScore);
        });
    } else {
        // means no db reads or writes for this player
        player.jumpScore += 1;
    }
    updateLabels();
}
