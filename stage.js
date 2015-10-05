// create BlockSprite object and add resulting sprite to stage
function createBlock(image, posX, posY) {
	allBlocks.push(new BlockSprite(image, posX, posY));
	allBlocks[allBlocks.length - 1].id = "b" + blockCount;
	blockPool.push(allBlocks[allBlocks.length - 1]);
	stage.addChild(allBlocks[allBlocks.length - 1].sprite);
	blockCount++;
	return blockCount;
}

function createRandomBlock(posX, posY) {

	var randBlock = "";
	switch (Math.round(Math.random() * 4)) {
	case 0:
		randBlock = "./res/sprites/m_block_red.png";
		break;
	case 1:
		randBlock = "./res/sprites/m_block_tangerine.png";
		break;
	case 2:
		randBlock = "./res/sprites/m_block_yellow.png";
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

	createBlock(randBlock, posX, posY);

}

function createStack(blockGroup, launchSpeed, launchTime){
	newStack = new BlockStack(blockGroup);
	newStack.DY = launchSpeed;
	newStack.launchTime = launchTime;
	stackPool.push(newStack);
	for(var i = 0; i < blockGroup.length; i++){
		blockPool.splice(blockPool.indexOf(blockGroup[i]), 1);
	}
}

// find block at given pixel coordinate location
function getBlockAt(posX, posY) {
	for (var i = 0; i < allBlocks.length; i++) {
		if ((allBlocks[i].sprite.position.x == posX) &&
			(allBlocks[i].sprite.position.y == posY)) {
			return allBlocks[i];
		}
	}
}

// launch single block
function launchBlock(launchBlock, launchSpeed, launchTime) {
	launchBlock.DY = launchSpeed;
	launchBlock.launchTime = launchTime;
	launchBlock.launching = 1;
}

// THIS FUNCTION IS DEPRECATED;
// USED FOR TESTING ONLY
// launch many blocks
function launchBlocks(launchSet, launchSpeed, launchTime) {
	for (var i = 0; i < launchSet.length; i++) {

		launchSet[i].DY = launchSpeed;
		launchSet[i].launchTime = launchTime;
		launchSet[i].launching = 1;
	}
}

function removeBlockGlobally(block){
	for(var i = 0; i < allBlocks.length; i++){
		if(allBlocks[i] === block){
			stage.removeChild(allBlocks[i].sprite);
			allBlocks.splice(i, 1);
		}
	}
}

// methods for movement



