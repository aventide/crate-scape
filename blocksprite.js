/**
 * BlockSprite Class
 *
 * Provides data structure for moving block objects
 * as well as getter, setter, and manipulation methods
 * to provide communication layer between simulation
 * logic and WebGL renderer
 *
 * Author: Alex J. Staples
 * Date last modified: 2/24/15
 *
 */
function BlockSprite(image, posX, posY) {

    // identification code for BlockSprite
    this.id = "";

    // texture taken from file, to be applied as the image for the sprite
    this.texture = PIXI.Texture.fromImage(image);
    this.type = image;

    // sprite seen on stage		
    this.sprite = new PIXI.Sprite(this.texture);

    // position of sprite on stage
    this.sprite.position.x = posX;
    this.sprite.position.y = posY;

    // enable interaction for sprite
    this.sprite.interactive = true;

    // anchor point or offset from the center, don't worry about this
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;

    // delta x and y, or the velocities of sprite in each 2D direction
    // NOTE: for y-axis values, higher number means LOWER on screen  
    this.DX = 0;
    this.DY = 1;

    // holds temporary y-velocity in cases where block is held "still", like changing position
    this.tempDY = 0;

    // whether a sprite is moving upwards or not
    this.launching = 0;

    // how long a sprite moves upwards
    this.launchTime = 0;

    // how fast a sprite moves upwards
    this.launchSpeed = 0;

    // place for sprite to stop if given a specific place to move towards
    this.haltPosition = {
        x: -1,
        y: -1
    }

    // set new position on stage for sprite 
    this.setPosition = function(posX, posY) {

        this.sprite.position.x = posX;
        this.sprite.position.y = posY;

    }

    // ---------------------------------------
    // methods for manipulating sprite motion:

    this.halt = function() {
        this.DX = 0;
        this.DY = 0;
    }

    // for methods moveUp through moveRight, scalar value is used for speed - use positive value

    this.moveUp = function(speed) {
        if (isNaN(speed)) {
            speed = 1;
        }
        this.DY = Math.abs(speed);
        this.DY *= -1;

    }

    this.moveDown = function(speed) {
        if (isNaN(speed)) {
            speed = 1;
        }
        this.DY = Math.abs(speed);

    }

    this.moveLeft = function(speed) {
        if (isNaN(speed)) {
            speed = 1;
        }
        this.DX = Math.abs(speed);
        this.DX *= -1;

    }

    this.moveRight = function(speed) {
        if (isNaN(speed)) {
            speed = 1;
        }
        this.DX = Math.abs(speed);

    }

    this.moveDirection = function(xSpeed, ySpeed) {
        this.DX = xSpeed; // in this case, you'll have to manually enter negative values
        this.DY = ySpeed; // for x and y to go left or up, respectively.
    }

    this.moveToPosition = function(destX, destY, factor) {

        if (isNaN(factor)) {
            factor = 0;
        }

        // make sure cell stops once it reaches its destination
        this.haltPosition.x = destX;
        this.haltPosition.y = destY;

        var difX = destX - this.sprite.position.x;
        var difY = destY - this.sprite.position.y;
        var ratio = 0;

        if (difX != 0) {
            ratio = difY / difX;
        } else {
            if (difY > 0) {
                ratio = 1;
            } else {
                ratio = -1;
            }
        }

        // solve double-negative problem with negative num and denom on ratio calculation
        if (difY < 0 && difX < 0) {
            ratio *= -1;
        }

        this.DY = ratio * (1 + factor);

        // make sure DX isn't set to nonzero value
        if (difX == 0) {
            this.DX = 0;
            return;
        }

        // don't question the statement below, it's for visual purposes
        this.DX = 1 * (1 + factor)
        if (difX < 0) {
            this.DX *= -1;
        }

    }

    this.swapYWith = function(otherBlock) {

        var tempY = this.sprite.position.y;
        this.sprite.position.y = otherBlock.sprite.position.y;
        otherBlock.sprite.position.y = tempY;

    }

    // -------------------------------
    // end motion manipulating methods

    // begin neighbor block methods
    // ----------------------------

    this.getBlocksAbove = function() {

        var topBlocks = [];
        for (var i = 0; i < blockCount; i++) {
            if ((allBlocks[i].sprite.position.x == this.sprite.position.x) &&
                (allBlocks[i].sprite.position.y < this.sprite.position.y)) {
                topBlocks.push(allBlocks[i]);
            }
        }
        return topBlocks;
    }

    this.getNearestBlockAbove = function() {
        var topBlocks = this.getBlocksAbove();
        var nearestBlock = topBlocks[0];
        for (var i = 0; i < topBlocks.length; i++) {
            if ((topBlocks[i].sprite.position.y - this.sprite.position.y) >
                (nearestBlock.sprite.position.y - this.sprite.position.y)) {
                nearestBlock = topBlocks[i];
            }
        }
        return nearestBlock;
    }

    this.getDirectBlockAbove = function() {
        var topBlocks = this.getBlocksAbove();
        for (var i = 0; i < topBlocks.length; i++) {
            if (topBlocks[i].sprite.position.y == this.sprite.position.y - 50) {
                return topBlocks[i];
            }
        }
    }

    this.getBlocksBelow = function() {

        var bottomBlocks = [];
        for (var i = 0; i < blockCount; i++) {
            if ((allBlocks[i].sprite.position.x == this.sprite.position.x) &&
                (allBlocks[i].sprite.position.y > this.sprite.position.y)) {
                bottomBlocks.push(allBlocks[i]);
            }
        }
        return bottomBlocks;
    }

    this.getNearestBlockBelow = function() {
        var bottomBlocks = this.getBlocksBelow();
        var nearestBlock = bottomBlocks[0];
        for (var i = 0; i < bottomBlocks.length; i++) {
            if ((this.sprite.position.y - bottomBlocks[i].sprite.position.y) >
                (this.sprite.position.y - nearestBlock.sprite.position.y)) {
                nearestBlock = bottomBlocks[i];
            }
        }
        return nearestBlock;
    }

    this.getDirectBlockBelow = function() {
        var bottomBlocks = this.getBlocksBelow();
        for (var i = 0; i < bottomBlocks.length; i++) {
            if (bottomBlocks[i].sprite.position.y == this.sprite.position.y + 50) {
                return bottomBlocks[i];
            }
        }
    }

    this.getIntersectingBlock = function() {

        if (this.sprite.position.y - this.getNearestBlockAbove().sprite.position.y < 50) {
            return this.getNearestBlockAbove();
        }

        if (this.getNearestBlockBelow().sprite.position.y - this.sprite.position.y < 50) {
            return this.getNearestBlockBelow();
        }

    }


    // --------------------------
    // end neighbor block methods

    // begin input handler methods
    // --------------------------- 

    // use the mousedown and touchstart
    this.sprite.mousedown = this.sprite.touchstart = function(data) {

        //console.log(allBlocks[stage.getChildIndex(this)]);

        var blockObject = allBlocks[stage.getChildIndex(this)];

        data.originalEvent.preventDefault()
            // store a reference to the data
            // The reason for this is because of multitouch
            // we want to track the movement of this particular touch
        this.data = data;
        this.alpha = 0.5;
        this.dragging = true;

        blockObject.tempDY = blockObject.DY;
        blockObject.DY = 0;

        //this.sx = this.data.getLocalPosition(this).x * this.scale.x;
        this.sy = this.data.getLocalPosition(this).y * this.scale.y;


    };

    // set the events for when the mouse is released or a touch is released
    this.sprite.mouseup = this.sprite.mouseupoutside = this.sprite.touchend = this.sprite.touchendoutside = function(data) {
        var blockObject = allBlocks[stage.getChildIndex(this)];

        this.alpha = 1;
        this.dragging = false;
        // set the interaction data to null
        this.data = null;

        blockObject.DY = blockObject.tempDY;
        if (blockObject.sprite.position.y + defaultGravity <= 575) {
            blockObject.DY = defaultGravity;
        }

    };

    // set the callbacks for when the mouse or a touch moves
    this.sprite.mousemove = this.sprite.touchmove = function(data) {
        if (this.dragging) {
            // need to get parent coords..
            var newPosition = this.data.getLocalPosition(this.parent);
            // this.position.x = newPosition.x;
            this.position.y = newPosition.y;
            //this.position.x = newPosition.x - this.sx;
            this.position.y = newPosition.y - this.sy;

            var blockObject = allBlocks[stage.getChildIndex(this)];

        }
    }

    // ---------------------------
    // end input handler methods


}