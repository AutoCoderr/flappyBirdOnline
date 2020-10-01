const config = require("./config"),
    diffAire = config.diffAire;

const msDefault = diffAire*10;
const scalePerDeplacment = 2;

class Animations {

    party;
    graphismes;

    constructor(party) {
        this.setParty(party);
        this.setGraphismes(party.graphismes)
    }

    setParty(party) {
        this.party = party;
    }

    setGraphismes(graphismes) {
        this.graphismes = graphismes;
    }

    moveFromTo(entity, xB, yB, ms, alterSpeed) {
        if (entity.deplacing) {
            return;
        }
        entity.deplacing = true;
        const xA = entity.x, yA = entity.y;
        if (ms == null) {
            ms = typeof (entity.speed) != "undefined" ? entity.speed : msDefault;
        }
        entity.exist = true;
        if (xA === xB && yA === yB) {
            return;
        }

        const distance = calculDistance(xA, yA, xB, yB);

        let fractionDistance = distance / scalePerDeplacment;
        ms *= scalePerDeplacment;

        let coefX;
        let coefY;

        if (xA > xB) {
            coefX = ((xA - xB) / fractionDistance) * (-1);
        } else if (xA < xB) {
            coefX = (xB - xA) / fractionDistance;
        } else {
            coefX = 0;
        }

        if (yA > yB) {
            coefY = ((yA - yB) / fractionDistance) * (-1);
        } else if (yA < yB) {
            coefY = (yB - yA) / fractionDistance;
        } else {
            coefY = 0;
        }


        entity.coefX = coefX;
        entity.coefY = coefY;

        let params = {
            totalDistance: distance,
            limit: fractionDistance,
            ms,
            originalMs: ms,
            entity,
            distanceWhenAlterSpeed: null,
            distanceDuringAlterSpeed: null,
            afterOrBefore: null
        };

        if (alterSpeed != null) {
            let afterOrBefore;
            let whenAlterSpeed;
            const msToChange = alterSpeed.to * scalePerDeplacment;
            if (typeof (alterSpeed.after) != "undefined") {
                afterOrBefore = "after";
                whenAlterSpeed = alterSpeed.after;
            } else if (typeof (alterSpeed.before) != "undefined") {
                afterOrBefore = "before";
                whenAlterSpeed = alterSpeed.before;
            }
            params.distanceWhenAlterSpeed = alterSpeed.proportional ? distance * whenAlterSpeed : whenAlterSpeed;
            params.distanceDuringAlterSpeed = afterOrBefore === "after" ? distance - params.distanceWhenAlterSpeed : params.distanceWhenAlterSpeed;
            params.distancePerCoef = calculDistance(0, 0, coefX, coefY);
            params.addToSpeedPerIteration = (msToChange - ms) / (params.distanceDuringAlterSpeed / params.distancePerCoef);
            params.afterOrBefore = afterOrBefore;
        }

        entity.params = params;

        this.deplaceRec(xA+coefX, yA+coefY, xA, yA, coefX, coefY, 0, params);
    }

    deplaceRec(x, y, xD, yD, coefX, coefY, i, params) {
        const currentDistance = calculDistance(xD, yD, x, y);
        if (params.distanceWhenAlterSpeed != null &&
            (
                (params.afterOrBefore === "after" && currentDistance >= params.distanceWhenAlterSpeed) ||
                (params.afterOrBefore === "before" && currentDistance <= params.distanceWhenAlterSpeed)
            )
        ) {
            let currentDistanceFromAlterSpeed = currentDistance - params.distanceWhenAlterSpeed;
            if (params.afterOrBefore === "before") currentDistanceFromAlterSpeed *= -1;
            let coefToAlterSpeed = currentDistanceFromAlterSpeed / params.distanceDuringAlterSpeed;
            coefToAlterSpeed *= 2;
            const msToAdd = params.addToSpeedPerIteration * coefToAlterSpeed;
            params.ms += msToAdd;
        }
        const entity = params.entity,
            limit = params.limit,
            ms = params.ms;
        let entityBefore = copyEntity(entity);

        if (entity != null) {
            if (!entity.exist) {
                entity.deplacing = false;
                return;
            }
            entity.x = x;
            entity.y = y;
            let collision = this.party.checkCollisions(entity);
            if (collision != false && collision != undefined) {
                if (typeof (collision.action) != "undefined") {
                    if (collision.action == "stopAnime") {
                        //entity.coefX = 0;
                        //entity.coefY = 0;
                        entity.deplacing = false;
                        return;
                    }
                }
                if (!entity.exist) {
                    entity.deplacing = false;
                    return;
                }
                //console.log(collision);
                if (typeof (collision) == "object") {
                    if (typeof (collision.reaction) == "undefined" | collision.reaction) {
                        entity.x += -1 * coefX;
                        entity.y += -1 * coefY;
                    }
                    this.graphismes.display(entity);
                    if (typeof (collision.mulCoefX) != "undefined" & typeof (collision.mulCoefY) != "undefined") {
                        setTimeout(() => {
                            if (collision.mulCoefX.type == "*") {
                                coefX = coefX * collision.mulCoefX.coef;
                            } else if (collision.mulCoefX.type == "+") {
                                coefX = coefX + collision.mulCoefX.coef;
                            }
                            if (collision.mulCoefY.type == "*") {
                                coefY = coefY * collision.mulCoefY.coef;
                            } else if (collision.mulCoefY.type == "+") {
                                coefY = coefY + collision.mulCoefY.coef;
                            }
                            const direction = calculdirection(entity.x, entity.y, coefX, coefY);
                            this.party.moveEntitieTo(entity.id, direction.x, direction.y, typeof (collision.ms) != "undefined" ? collision.ms : ms);
                            entity.coefX = coefX;
                            entity.coefY = coefY;
                        }, 5);
                        return;
                    } else if (typeof (collision.function) == "function") {
                        collision.function();
                    }
                    if (typeof (collision.action) != "undefined" & collision.action == "stopEntity") {
                        entity.coefX = 0;
                        entity.coefY = 0;
                        entity.deplacing = false;
                        return;
                    }
                } else {
                    this.graphismes.display(entity);
                    entity.coefX = 0;
                    entity.coefY = 0;
                    return;
                }
            }
            if (typeof (entity.toExecuteOnDeplacement) == "function") {
                entity.toExecuteOnDeplacement(entity);
            }
        }
        this.graphismes.hideAndDisplay(entityBefore,entity);
        if (i >= limit) {
            entity.coefX = 0;
            entity.coefY = 0;
            entity.deplacing = false;
            if (typeof (entity.toExecuteWhenStopped) == "function") {
                entity.toExecuteWhenStopped(entity);
            }
            return;
        }
        entity.timeout = setTimeout(() => {
            x += coefX;
            y += coefY;
            this.deplaceRec(x, y, xD, yD, coefX, coefY, i + 1, params);
        }, ms);
    }

}

function calculdirection(x, y, coefX, coefY) {
    x += coefX*3000;
    y += coefY*3000;
    return {x: x, y: y};
}

function calculDistance(xA,yA,xB,yB) {
    return Math.sqrt((xA-xB)**2+(yA-yB)**2);
}

function copyEntity(entity) {
    let copy = {};
    for (let key in entity) {
        if (typeof(entity[key]) != "object") {
            copy[key] = entity[key];
        }
    }
    return copy;
}

module.exports = Animations;
