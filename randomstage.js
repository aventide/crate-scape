/**
 * Random Stage Generator 
 * 
 * Creates a random stage for the cell simulation.  
 * Places random cell types and random bubble types 
 * in random spots on the stage.
 * 
 * Author: Alex J. Staples
 * Date last modified: 12/07/14
 * 
 */ 

function genRandStage(cellLimit, bubbleLimit){

  for(var k = 0; k < cellLimit; k++){
    var randX    = (Math.random() * 1200) + 60;
    var randY    = (Math.random() * 700) + 60;
    
    if(randX > 1160){
      randX -= 101;
    }
    if(randY > 640){
      randY -= 101;
    }
    
    var randCell = "";
    switch(Math.round(Math.random() * 4)){
      case 0: randCell = "./res/sprites/cellsprite_blue.png";
      break;
      case 1: randCell = "./res/sprites/cellsprite_orange.png";
      break;
      case 2: randCell = "./res/sprites/cellsprite_green.png";
      break;
      case 3: randCell = "./res/sprites/cellsprite_purple.png";
      break;
      case 4: randCell = "./res/sprites/cellsprite_red.png";
      break;
      default: randCell = "./res/sprites/cellsprite_blue.png";
      break;
    }
  
    //alert(randX, randY);
    createCell(randCell, randX, randY);
  }
  
  for(var k = 0; k < bubbleLimit; k++){
    var randX    = (Math.random() * 1200) + 60;
    var randY    = (Math.random() * 700) + 60;
    
    if(randX > 1140){
      randX -= 101;
    }
    if(randY > 640){
      randY -= 101;
    }
    
    // increased chance of health bubble
    
    var randBubble = "";
    switch(Math.round(Math.random() * 9)){
      case 0: randBubble = "./res/bubbles/change_bubble.png";
      break;
      case 1: randBubble = "./res/bubbles/contentment_bubble.png";
      break;
      case 2: randBubble = "./res/bubbles/curiosity_bubble.png";
      break;
      case 3: randBubble = "./res/bubbles/health_bubble.png";
      break;
      case 4: randBubble = "./res/bubbles/mutation_bubble.png";
      break;
      case 5: randBubble = "./res/bubbles/sight_bubble.png";
      break;
      case 6: randBubble = "./res/bubbles/speed_bubble.png";
      break;
      case 7: randBubble = "./res/bubbles/tolerance_bubble.png";
      break;
      default: randBubble = "./res/bubbles/health_bubble.png";
      break;
    }
  
    //alert(randX, randY);
    createBubble(randBubble, randX, randY);
  }

}  
