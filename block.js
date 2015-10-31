/**
 * BlockSprite Class
 *
 * Provides data structure for moving block objects
 * as well as getter, setter, and manipulation methods
 * to provide communication layer between simulation
 * logic and WebGL renderer
 *
 * Author: Alex J. Staples
 * Date last modified: 8/9/15
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
	//this.DX = 0;
	this.DY = defaultGravity;

	// holds temporary y-velocity in cases where DY changes briefly
	//this.tempDY = 0;

	// whether a sprite is moving upwards or not
	this.launching = 0;

	// how much longer (in frames) a sprite will remain moving upwards
	this.launchTime = 0;

	// whether to skip block to resolve asynchronous call problems
	this.skipCycle = 0;
	
	// set new position on stage for sprite
	this.setPosition = function (posX, posY) {

		this.sprite.position.x = posX;
		this.sprite.position.y = posY;

	}

	// ---------------------------------------
	// methods for manipulating sprite motion:

	this.halt = function () {
		this.DX = 0;
		this.DY = 0;
	}

	// for methods moveUp through moveRight, scalar value is used for speed - use positive value

	this.moveUp = function (speed) {
		if (isNaN(speed)) {
			speed = 1;
		}
		this.DY = Math.abs(speed);
		this.DY *= -1;

	}

	this.moveDown = function (speed) {
		if (isNaN(speed)) {
			speed = 1;
		}
		this.DY = Math.abs(speed);

	}

	this.swapYWith = function (otherBlock) {

		var tempY = this.sprite.position.y;
		this.sprite.position.y = otherBlock.sprite.position.y;
		otherBlock.sprite.position.y = tempY;

	}

	// -------------------------------
	// end motion manipulating methods

	// begin neighbor block methods
	// ----------------------------

	this.getBlocksAbove = function () {

		var topBlocks = [];
		for (var i = 0; i < allBlocks.length; i++) {
			if ((allBlocks[i].sprite.position.x == this.sprite.position.x) &&
				(allBlocks[i].sprite.position.y < this.sprite.position.y)) {
				topBlocks.push(allBlocks[i]);
			}
		}
		return topBlocks;
	}

	this.getNearestBlockAbove = function () {
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

	this.getDirectBlockAbove = function () {
		var topBlocks = this.getBlocksAbove();
		for (var i = 0; i < topBlocks.length; i++) {
			if (topBlocks[i].sprite.position.y == this.sprite.position.y - 50) {
				return topBlocks[i];
			}
		}
	}

	this.getBlocksBelow = function () {

		var bottomBlocks = [];
		for (var i = 0; i < allBlocks.length; i++) {
			if ((allBlocks[i].sprite.position.x == this.sprite.position.x) &&
				(allBlocks[i].sprite.position.y > this.sprite.position.y)) {
				bottomBlocks.push(allBlocks[i]);
			}
		}
		return bottomBlocks;
	}

	this.getNearestBlockBelow = function () {
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

	this.getDirectBlockBelow = function () {
		var bottomBlocks = this.getBlocksBelow();
		for (var i = 0; i < bottomBlocks.length; i++) {
			if (bottomBlocks[i].sprite.position.y == this.sprite.position.y + 50) {
				return bottomBlocks[i];
			}
		}
	}

	this.getDirectBlockLeft = function () {

		for (var i = 0; i < allBlocks.length; i++) {
			if ((allBlocks[i].sprite.position.y == this.sprite.position.y) &&
				(allBlocks[i].sprite.position.x == this.sprite.position.x - 50)) {
				return allBlocks[i];
			}
		}

	}

	this.getDirectBlockRight = function () {

		for (var i = 0; i < allBlocks.length; i++) {
			if ((allBlocks[i].sprite.position.y == this.sprite.position.y) &&
				(allBlocks[i].sprite.position.x == this.sprite.position.x + 50)) {
				return allBlocks[i];
			}
		}

	}

	this.getIntersectingBlock = function () {
		if (this.sprite.position.y - this.getNearestBlockAbove().sprite.position.y < 50) {
			return this.getNearestBlockAbove();
		}

		if (this.getNearestBlockBelow().sprite.position.y - this.sprite.position.y < 50) {
			return this.getNearestBlockBelow();
		}
	}

	// --------------------------
	// end neighbor block methods

	// begin neighbor stack methods
	// --------------------------

	this.isFreeBlock = function () {
		for (var i = 0; i < blockPool.length; i++) {
			if (this === blockPool[i]) {
				return true;
			}
		}
		return false;
	}

	this.getStackIn = function () {
		for (var i = 0; i < stackPool.length; i++) {
			for (var j = 0; j < stackPool[i].blocks.length; j++) {
				if (stackPool[i].blocks[j] === this) {
					return stackPool[i];
				}
			}
		}
		//return undefined;
	}

	this.getDirectStackBelow = function () {
		testBlock = this.getDirectBlockBelow();
		for (var i = 0; i < stackPool.length; i++) {
			if (stackPool[i].getTopBlock() === testBlock) {
				return stackPool[i];
			}
		}
	}

	this.getDirectStackAbove = function () {
		testBlock = this.getDirectBlockAbove();
		for (var i = 0; i < stackPool.length; i++) {
			if (stackPool[i].getBottomBlock() === testBlock) {
				return stackPool[i];
			}
		}
	}

	// --------------------------
	// end neighbor stack methods

	// begin block type methods
	// ---------------------------

	this.changeType = function (blockImage) {
		this.sprite.texture = PIXI.Texture.fromImage(blockImage);
		this.type = blockImage;
	}

	this.setRandomType = function () {
		var randBlock = "";
		switch (Math.round(Math.random() * 4)) {
		case 0:
			randBlock = "./res/sprites/m_block_red.png";
			break;
		case 1:
			randBlock = "./res/sprites/m_block_tangerine.png";
			break;
		case 2:
			randBlock = "./res/sprites/m_block_green.png";
			break;
		case 3:
			randBlock = "./res/sprites/m_block_blue.png";
			break;
		case 4:
			randBlock = "./res/sprites/m_block_purple.png";
			break;
		default:
			randBlock = "./res/sprites/m_block_red.png";
			break;
		}
		this.sprite.texture = PIXI.Texture.fromImage(randBlock);
		this.type = randBlock;
	}

	// --------------------------
	// end block type methods

	// begin input handler methods
	// ---------------------------


	this.sprite.on('mousedown', onDragStart)
	this.sprite.on('touchstart', onDragStart)
	// events for drag end
	this.sprite.on('mouseup', onDragEnd)
	this.sprite.on('mouseupoutside', onDragEnd)
	this.sprite.on('touchend', onDragEnd)
	this.sprite.on('touchendoutside', onDragEnd)
	// events for drag move
	this.sprite.on('mousemove', onDragMove)
	this.sprite.on('touchmove', onDragMove);

	function onDragStart(event) {
		// store a reference to the data
		// the reason for this is because of multitouch
		// we want to track the movement of this particular touch
		this.data = event.data;
		this.alpha = 0.5;
		this.dragging = true;
	}

	function onDragEnd() {
		this.alpha = 1;

		this.dragging = false;

		// set the interaction data to null
		this.data = null;
	}

	function onDragMove() {
		if (this.dragging) {

			var blockObject = allBlocks[stage.getChildIndex(this)];
			var directBlockAbove = blockObject.getDirectBlockAbove();
			var directBlockBelow = blockObject.getDirectBlockBelow();

			var newPosition = this.data.getLocalPosition(this.parent);
			
			// single block launch
			if ((newPosition.y <= (blockObject.sprite.position.y - 25)) && (blockObject.getDirectBlockAbove() === undefined)) {
				launchBlock(blockObject, -8, 30);
			}

			// swapping place with block above this one
			if ((directBlockAbove != undefined) && (newPosition.y <= (directBlockAbove.sprite.position.y))) {

				if (blockObject.getStackIn() == undefined && directBlockAbove.type == "./res/sprites/m_block_cracked.png") {
					return;
				}
				blockObject.swapYWith(directBlockAbove);

			}

			// swapping place with block below this one
			if ((directBlockBelow != undefined) && (newPosition.y >= (directBlockBelow.sprite.position.y))) {

				if (blockObject.type == "./res/sprites/m_block_cracked.png" && directBlockBelow.getStackIn() == undefined) {
					return;
				}

				blockObject.swapYWith(directBlockBelow);

			}

		}
	}


// ---------------------------
// end input handler methods

}
