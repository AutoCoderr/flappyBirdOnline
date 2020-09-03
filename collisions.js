const collisions = {
    player: {
        bord: function (player,bord) {
            if (bord.pos === "haut") {
                setTimeout(() => {
                    teleportEntitieTo(player.id,player.x,player.y+2);
                    writeBorder(bord.pos);
                }, 100);
                return {action: "stopEntity"};
            } else if (bord.pos === "bas") {
                return lostPV();
            }
        },
        tuyaux: function (player, tuyaux) {
            return lostPV();
        },
        tuyauxUpsideDown: function (player, tuyaux) {
            return lostPV();
        },
        pipeDetector: function(player,pipeDetector) {
            if (!pipeDetector.alreadyCounted) {
                pipePassed += 1;
                document.getElementById("pipePassed").innerText = pipePassed;
                pipeDetector.alreadyCounted = true;
            }
            return false;
        }
    },
    pipe: {
        player: function(pipe,player){
            return lostPV();
        },
        bord: function(pipe,bord) {
            if (bord.pos === "gauche") {
                removeEntitie(pipe.id);
                writeBorder(bord.pos);
                return {action: "stopAnime"}
            }
            writeBorder(bord.pos);
            return false;
        }
    },
    pipeDetector: {
        bord: function(pipeDetector,bord) {
            if (bord.pos === "gauche") {
                removeEntitie(pipeDetector.id);
                return {action: "stopAnime"}
            }
            return false;
        },
        player: function(pipeDetector,player) {
            if (!pipeDetector.alreadyCounted) {
                pipePassed += 1;
                document.getElementById("pipePassed").innerText = pipePassed;
                pipeDetector.alreadyCounted = true;
            }
            return false;
        }
    },
    pipeUpsideDown: {
        player: function(pipe,player){
            return lostPV();
        },
        bord: function(pipe,bord) {
            if (bord.pos === "gauche") {
                removeEntitie(pipe.id);
                writeBorder(bord.pos);
                return {action: "stopAnime"}
            }
            writeBorder(bord.pos);
            return false;
        }
    }
};

module.exports = collisions;
