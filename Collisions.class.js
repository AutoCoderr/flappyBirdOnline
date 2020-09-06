const collisions = {
    player: {
        bord: function (player,bord,party) {
            if (bord.pos === "haut") {
                setTimeout(() => {
                    party.teleportEntitieTo(player.id,player.x,player.y+2);
                    party.writeBorder(bord.pos);
                }, 100);
                return {action: "stopEntity"};
            } else if (bord.pos === "bas") {
                return party.lostPV(player.player);
            }
        },
        tuyaux: function (player, tuyaux, party) {
            return party.lostPV(player.player);
        },
        tuyauxUpsideDown: function (player, tuyaux, party) {
            return party.lostPV(player.player);
        },
        pipeDetector: function(player,pipeDetector, party) {
            if (!pipeDetector.alreadyCounted) {
                player.player.pipePassed += 1;
                player.player.socket.emit("display_pipes_passed", player.player.pipePassed)
                pipeDetector.alreadyCounted = true;
            }
            return false;
        }
    },
    pipe: {
        player: function(pipe,player,party){
            return party.lostPV(player.player);
        },
        bord: function(pipe,bord,party) {
            if (bord.pos === "gauche") {
                party.removeEntitie(pipe.id);
                party.writeBorder(bord.pos);
                return {action: "stopAnime"}
            }
            party.writeBorder(bord.pos);
            return false;
        }
    },
    pipeDetector: {
        bord: function(pipeDetector,bord,party) {
            if (bord.pos === "gauche") {
                party.removeEntitie(pipeDetector.id);
                return {action: "stopAnime"}
            }
            return false;
        },
        player: function(pipeDetector,player,party) {
            if (!pipeDetector.alreadyCounted) {
                player.player.pipePassed += 1;
                player.player.socket.emit("display_pipes_passed", player.player.pipePassed)
                pipeDetector.alreadyCounted = true;
            }
            return false;
        },
        pipe: function (pipeDetector,pipe,party) {
            return false;
        }
    },
    pipeUpsideDown: {
        player: function(pipe,player,party){
            return party.lostPV(player.player);
        },
        bord: function(pipe,bord,party) {
            if (bord.pos === "gauche") {
                party.removeEntitie(pipe.id);
                party.writeBorder(bord.pos);
                return {action: "stopAnime"}
            }
            party.writeBorder(bord.pos);
            return false;
        }
    }
};

class Collisions {
    party;

    constructor(party) {
        this.setParty(party);
    }

    exec(entityA, entityB) {
        if (typeof(collisions[entityA.type]) != "undefined") {
            if (typeof(collisions[entityA.type][entityB.type]) != "undefined") {
                return collisions[entityA.type][entityB.type](entityA,entityB,this.party);
            }
        }
        return true;
    }

    setParty(party) {
        this.party = party;
    }
}

module.exports = Collisions;
