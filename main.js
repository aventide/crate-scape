// create an new instance of a pixi stage
var stage = new PIXI.Container();

// create a renderer instance
var renderer = PIXI.autoDetectRenderer(500, 600);
renderer.backgroundColor = 0xCCE6FF;

// add renderer to div where it's supposed to go
document.getElementById('ai-center').appendChild(renderer.view);

requestAnimationFrame(animate);

var blockCount = 0;
var allBlocks = [];
var blockPool = [];
var stackPool = [];

var dropCounter = 0;

createRandomBlock(25, 575);
createRandomBlock(75, 575);
createRandomBlock(125, 575);
createRandomBlock(175, 575);
createRandomBlock(225, 575);
createRandomBlock(275, 575);
createRandomBlock(325, 575);
createRandomBlock(375, 575);
createRandomBlock(425, 575);
createRandomBlock(475, 575);

createRandomBlock(25, 525);
createRandomBlock(75, 525);
createRandomBlock(125, 525);
createRandomBlock(175, 525);
createRandomBlock(225, 525);
createRandomBlock(275, 525);
createRandomBlock(325, 525);
createRandomBlock(375, 525);
createRandomBlock(425, 525);
createRandomBlock(475, 525);

createRandomBlock(25, 475);
createRandomBlock(75, 475);
createRandomBlock(125, 475);
createRandomBlock(175, 475);
createRandomBlock(225, 475);
createRandomBlock(275, 475);
createRandomBlock(325, 475);
createRandomBlock(375, 475);
createRandomBlock(425, 475);
createRandomBlock(475, 475);


function animate() {
	requestAnimationFrame(animate);

	// loop through each single block and stack and render stage


	// loop through single blocks
	for (var i = 0; i < blockPool.length; i++) {

		if (blockPool[i].launching) {
			if (blockPool[i].launchTime <= 0) {
				blockPool[i].launching = 0;
				blockPool[i].DY = defaultGravity;
			} else {
				blockPool[i].launchTime--;
			}
		}

		// block is moving downwards
		if (blockPool[i].DY > 0) {

			// block is about to hit bottom
			if ((blockPool[i].sprite.position.y + blockPool[i].DY) >= 575) {
				blockPool[i].sprite.position.y = 575;
				blockPool[i].halt();
				if (blockPool[i].type == "./res/sprites/m_block_cracked.png") {
					blockPool[i].setRandomType();
				}
			}

			// there is another block below that could be hit
			else if (blockPool[i].getBlocksBelow().length > 0) {

				// distance between block and block below
				yDist = (blockPool[i].getNearestBlockBelow().sprite.position.y - blockPool[i].sprite.position.y) - 50;

				// no violation will occur
				if (yDist > blockPool[i].DY) {
					blockPool[i].sprite.position.y += blockPool[i].DY;
				}
				// will mate with block below
				else if (yDist >= 0) {
					blockPool[i].sprite.position.y += yDist;
					blockPool[i].halt();
					if (blockPool[i].type == "./res/sprites/m_block_cracked.png") {
						blockPool[i].setRandomType();
					}
				} else {
					// do nothing for now
				}

			}
			// block is falling onto empty space
			else {
				blockPool[i].sprite.position.y += blockPool[i].DY;
			}

		}

		// block is moving upwards
		else if (blockPool[i].DY < 0) {

			// there is another block above that could be hit
			if (blockPool[i].getBlocksAbove().length > 0) {

				// distance between block and block above
				yDist = (blockPool[i].sprite.position.y - blockPool[i].getNearestBlockAbove().sprite.position.y) - 50;

				// do not violate block above
				if (yDist <= (blockPool[i].DY * -1)) {

					blockPool[i].sprite.position.y -= yDist;

					// if hitting a stack
					if (blockPool[i].getDirectStackAbove() != undefined) {
						tempStack = blockPool[i].getDirectStackAbove();
						tempStack.mergeRisingBlock(blockPool[i]);
					}
					// hitting another block
					else {
						blockGroup = [];
						blockAbove = blockPool[i].getDirectBlockAbove();
						
						blockGroup.push(blockPool[i]);
							
						while(blockAbove != undefined){
							blockGroup.push(blockAbove);
							blockAbove = blockAbove.getDirectBlockAbove();
						}
						
						createStack(blockGroup, blockPool[i].DY, blockPool[i].launchTime);
					}

				}

				// will not go too close the block above
				else {
					blockPool[i].sprite.position.y += blockPool[i].DY;
				}

			}

			// no blocks above
			else {
				blockPool[i].sprite.position.y += blockPool[i].DY;
			}

		} else {
			if (blockPool[i].getDirectBlockBelow() == undefined && blockPool[i].sprite.position.y != 575) {
				blockPool[i].DY = defaultGravity;
			}
		}
	}

	iter = 0;

	// loop through stacks
	for (var i = 0; i < stackPool.length; i++) {

		if (stackPool[i].launchTime <= 0) {
			stackPool[i].DY = defaultGravity;
		} else {
			stackPool[i].launchTime--;
		}

		// pre-calculate bottom and top blocks to avoid running getBottom/TopBlock() multiple times
			bottomBlock = stackPool[i].getBottomBlock();
			topBlock = stackPool[i].getTopBlock();
		
		// stack is moving downwards
		if (stackPool[i].DY > 0) {
		
			// stack is about to hit bottom
			if ((bottomBlock.sprite.position.y + stackPool[i].DY) >= 575) {
				stackPool[i].yShift(575 - bottomBlock.sprite.position.y);
				stackPool[i].halt();
				stackPool[i].decay();
				stackPool.splice(i, 1);
			}
			// there are blocks below the stack could hit
			else if (bottomBlock.getBlocksBelow().length > 0) {

				yDist = (bottomBlock.getNearestBlockBelow().sprite.position.y - bottomBlock.sprite.position.y) - 50;

				// about to hit a block below
				if (stackPool[i].DY >= yDist) {

					stackPool[i].yShift(yDist);

					// block is still, so decay the stack
					if (bottomBlock.getDirectBlockBelow().DY == 0) {

						stackPool[i].halt();
						stackPool[i].decay();

						stackPool.splice(i, 1);
					}
					// block is moving up, so carry the momentum upwards
					else {
						stackPool[i].mergeRisingBlock(bottomBlock.getDirectBlockBelow());
					}
				} else {
					stackPool[i].yShift(stackPool[i].DY);
				}
			}
			// should be fine to move down otherwise, we shall see...
			else {
				stackPool[i].yShift(stackPool[i].DY);
			}

		}

		// stack is moving upwards
		else if (stackPool[i].DY < 0) {

			// there is an entity above that could be hit
			if (topBlock.getBlocksAbove().length > 0) {

				var yDist = (stackPool[i].getTopBlock().sprite.position.y - stackPool[i].getTopBlock().getNearestBlockAbove().sprite.position.y) - 50;

				// will hit a free block above
				if (topBlock.getNearestBlockAbove().isFreeBlock() && (stackPool[i].DY * -1) >= yDist) {
					stackPool[i].yShift(yDist * -1);
					stackPool[i].mergeFallingBlock(topBlock.getDirectBlockAbove());
					stackPool[i].yShift(stackPool[i].DY - (yDist * -1));
				}

				// will hit a stack above
				else if (!(topBlock.getNearestBlockAbove().isFreeBlock()) && (stackPool[i].DY * -1) >= yDist) {
					stackPool[i].yShift(yDist * -1);
					stackPool[i].mergeStack(topBlock.getDirectBlockAbove().getStackIn());
					stackPool[i].yShift(stackPool[i].DY - (yDist * -1));
				}

				// no violation will occur
				else {
					stackPool[i].yShift(stackPool[i].DY);
				}

			}
			// should be ok to just shift upwards, we shall see...
			else {
				stackPool[i].yShift(stackPool[i].DY);
			}

			// top block pushed out of arena
			if (topBlock.sprite.position.y <= -25) {
				temp = topBlock;
				stackPool[i].blocks.splice(stackPool[i].blocks.indexOf(temp), 1);
				removeBlockGlobally(temp);

				// if there are no more blocks left in this stack, delete the associated stack object
				if (stackPool[i].blocks.length == 0) {
					stackPool.splice(i, 1);
				}
			}

		}

		// stack is staying still
		else {
			// reserve space for crazy edge case
		}

	}

	for (var i = 0; i < allBlocks.length; i++) {

		// horizontal matching 3 in a row, first come first served
		var leftNeighbor = allBlocks[i].getDirectBlockLeft();
		var rightNeighbor = allBlocks[i].getDirectBlockRight();

		if (leftNeighbor != undefined && leftNeighbor.type == allBlocks[i].type && rightNeighbor != undefined && rightNeighbor.type == allBlocks[i].type && allBlocks[i].type != "./res/sprites/m_block_cracked.png") {

			leftNeighbor.changeType("./res/sprites/m_block_cracked.png");
			allBlocks[i].changeType("./res/sprites/m_block_cracked.png");
			rightNeighbor.changeType("./res/sprites/m_block_cracked.png");

			launchBlock(leftNeighbor, -4, 100);
			launchBlock(allBlocks[i], -4, 100);
			launchBlock(rightNeighbor, -4, 100);

		}
	}

	// render the stage
	renderer.render(stage);

	// if at counter threshold/randomvalue,
	// drop one or more random blocks.
	//
	//
	if (dropCounter == 80 && dropEnabled) {

		dropCounter = 0;

		var randSpawn = ((Math.floor((Math.random() * 10) + 1)) * 50) - 25;

		createRandomBlock(randSpawn, -75);

	}
	dropCounter++;

	
}
