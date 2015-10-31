function BlockStack(blockGroup) {

	this.id = "";
	this.blocks = blockGroup;

	// vectors
	this.DY

	// whether a stack is moving upwards or not
	this.launching = 0;

	// how much longer (in frames) a stack will remain moving upwards
	this.launchTime = 0;

	// determines whether this stack is allowed to leave the arena
	this.allowEscape = 1;

	// merge two blocks into this supposedly new stack
	// DEPRECATED; for testing only
	// this.bbJoin = function (block1, block2) {
	// this.blocks.push(block1);
	// this.blocks.push(block2);
	// blockPool.splice(blockPool.indexOf(block1), 1);
	// blockPool.splice(blockPool.indexOf(block2), 1);
	// }

	// merge a rising free block into this stack
	this.mergeRisingBlock = function (block) {
		this.blocks.push(block);

		var topBlock = this.getTopBlock();
		
		if (topBlock.getBlocksAbove().length > 0) {

			var yDist = topBlock.sprite.position.y - topBlock.getNearestBlockAbove().sprite.position.y - 50;

			if (yDist <= 50) {

				this.yShift(yDist * -1);

				// if hitting another stack
				if (!(topBlock.getDirectBlockAbove().isFreeBlock())) {
					this.mergeStack(topBlock.getDirectBlockAbove().getStackIn());
					// ERROR OCCURS HERE: index could be disturbed by splicing operation
				}
				// if hitting a free block
				else {
					this.mergeFallingBlock(topBlock.getDirectBlockAbove());
				}
			} else {
				this.yShift(-50);
			}
		} else {
			this.yShift(-50);
		}

		//this.DY = block.DY;
		this.launchTime = block.launchTime;
		blockPool.splice(blockPool.indexOf(block), 1);
	}

	// merge a falling free block into this stack
	this.mergeFallingBlock = function (block) {
		this.blocks.push(block);
		blockPool.splice(blockPool.indexOf(block), 1);
	}

	// merge another stack into this stack
	this.mergeStack = function (stack) {
		this.blocks = this.blocks.concat(stack.blocks);
		stackPool.splice(stackPool.indexOf(stack), 1);
	}

	// set movement of zero for all blocks in stack
	this.halt = function () {
		for (var i = 0; i < this.blocks.length; i++) {
			this.blocks[i].DY = 0;
		}
	}

	// add all individual blocks to blocks pool
	// don't forget to remove this stack from stack pool!
	// you can use the return value to do this
	this.decay = function () {
		for (var i = 0; i < this.blocks.length; i++) {
			this.blocks[i].DY = 1;
			blockPool.push(this.blocks[i]);
		}
		return this;
	}

	this.getBottomBlock = function () {

		var bottomBlock = this.blocks[0];

		for (var i = 1; i < this.blocks.length; i++) {
			if (this.blocks[i].sprite.position.y > bottomBlock.sprite.position.y) {
				bottomBlock = this.blocks[i];
			}
		}
		return bottomBlock;
	}

	this.getTopBlock = function () {
		var topBlock = this.blocks[0];

		for (var i = 1; i < this.blocks.length; i++) {
			if (this.blocks[i].sprite.position.y < topBlock.sprite.position.y) {
				topBlock = this.blocks[i];
			}
		}
		return topBlock;
	}

	this.yShift = function (DY) {
		for (var i = 0; i < this.blocks.length; i++) {
			this.blocks[i].sprite.position.y += DY;
		}
	}

}
