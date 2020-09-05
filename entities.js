const config = require("./config"),
    diffAire = config.diffAire,
    spaceBetweenTwoPipe = config.spaceBetweenTwoPipe,
    widthCanvas = config.width,
    heightCanvas = config.height;

const graphismes = require("./graphismes"),
    display = graphismes.display,
    hide = graphismes.hide;

const animations = require("./Animations.class"),
    moveFromTo = animations.moveFromTo;

const collisions = require("./Collisions.class");

function removeEntitie(id) {
    if (typeof(entities[id]) == "undefined") {
        console.log("Entity not found");
        return;
    }
    entities[id].exist = false;
    if (entities[id].timeout != null) clearTimeout(entities[id].timeout);
    hide(entities[id]);
    delete entities[id];
}

function removeAllEntities() {
    for (let id in entities) {
        removeEntitie(id);
    }
}

function moveEntitieTo(id,xB,yB,ms,alterSpeed) {
    if (typeof(entities[id]) == "undefined") {
        console.log("Entity not found : "+id);
        console.log(entities[id]);
        return;
    }
    moveFromTo(entities[id],xB,yB,ms,alterSpeed);
}

function teleportEntitieTo(id,x,y) {
    if (typeof(entities[id]) == "undefined") {
        console.log("Entity not found");
        return;
    }
    stopEntitie(id);
    let entity = entities[id];
    hide(entity);
    entity.x = x;
    entity.y = y;
    display(entity);
}

function stopEntitie(id) {
    if (typeof(entities[id]) == "undefined") {
        console.log("Entity not found");
        return;
    }
    let entity = entities[id];
    if (entity.timeout != null) clearTimeout(entity.timeout);
    entity.coefX = 0;
    entity.coefY = 0;
    entity.deplacing = false;
}

const paramsEntities = {
    player: {
        w: 7/diffAire,
        h: 7/diffAire,
        radius: 3/diffAire
    },
    pipe: {
        w: 25/diffAire,
        h: 50/diffAire
    },
    pipeUpsideDown: {
        w: 25/diffAire,
        h: 50/diffAire
    },
    pipeDetector: {
        w: 25/diffAire,
        h: spaceBetweenTwoPipe-8,
        alreadyCounted: false
    }
};

function checkCollisions(entity) {
    if (entity.x <= 0 | entity.x+entity.w >= widthCanvas) {
        if (typeof(collisions[entity.type]) != "undefined") {
            if (typeof(collisions[entity.type].bord) != "undefined") {
                const collision = collisions[entity.type].bord(entity,{pos: (entity.x <= 0 ? "gauche" : "droite")});
                if (collision != null && collision !== false) return collision;
            } else {
                return {action: "stopEntity"};
            }
        } else {
            return {action: "stopEntity"};
        }
    } else if (entity.y <= 0 | entity.y+entity.h >= heightCanvas) {
        if (typeof(collisions[entity.type]) != "undefined") {
            if (typeof(collisions[entity.type].bord) != "undefined") {
                const collision = collisions[entity.type].bord(entity,{pos: (entity.y <= 0 ? "haut" : "bas")});
                if (collision != null && collision !== false) return collision;
            } else {
                return {action: "stopEntity"};
            }
        } else {
            return {action: "stopEntity"};
        }
    }

    let otherEntity;
    for (let id in entities) {
        if (id != entity.id) {
            otherEntity = entities[id];

            if ((((entity.x <= otherEntity.x & otherEntity.x <= entity.x+entity.w) |
                (entity.x <= otherEntity.x+otherEntity.w & otherEntity.x+otherEntity.w <= entity.x+entity.w))
                &
                ((entity.y <= otherEntity.y & otherEntity.y <= entity.y+entity.h) |
                 (entity.y <= otherEntity.y+otherEntity.h & otherEntity.y+otherEntity.h <= entity.y+entity.h)))

                |

                (((entity.x < otherEntity.x & otherEntity.x+otherEntity.w < entity.x+entity.w) |
                 (otherEntity.x < entity.x & entity.x+entity.w < otherEntity.x+otherEntity.w))
                &
                ((entity.y < otherEntity.y & otherEntity.y+otherEntity.h < entity.y+entity.h) |
                 (otherEntity.y < entity.y & entity.y+entity.h < otherEntity.y+otherEntity.h)))

                |

                (((entity.x < otherEntity.x & otherEntity.x+otherEntity.w < entity.x+entity.w) |
                 (otherEntity.x < entity.x & entity.x+entity.w < otherEntity.x+otherEntity.w))
                &
                ((entity.y <= otherEntity.y & otherEntity.y <= entity.y+entity.h) |
                 (entity.y <= otherEntity.y+otherEntity.h & otherEntity.y+otherEntity.h <= entity.y+entity.h)))

                |

                (((entity.x <= otherEntity.x & otherEntity.x <= entity.x+entity.w) |
                (entity.x <= otherEntity.x+otherEntity.w & otherEntity.x+otherEntity.w <= entity.x+entity.w))
                &
                ((entity.y < otherEntity.y & otherEntity.y+otherEntity.h < entity.y+entity.h) |
                 (otherEntity.y < entity.y & entity.y+entity.h < otherEntity.y+otherEntity.h)))
                ) {
                if (typeof(collisions[entity.type]) != "undefined") {
                    if (typeof(collisions[entity.type][otherEntity.type]) != "undefined") {
                        return collisions[entity.type][otherEntity.type](entity,otherEntity);
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        }
    }
    return false;
}

module.exports = {
    spawnEntitie,
    removeEntitie,
    removeAllEntities,
    moveEntitieTo,
    teleportEntitieTo,
    stopEntitie,
    checkCollisions
};
