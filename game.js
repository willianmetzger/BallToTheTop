let width = 600;
let height = 800;
this.ProtoGame = {};
this.GameMenu ={};

ProtoGame.State = function (game){
  //import Player from "./Classes/Player"
  
  // Initialize the Phaser Game object and set default game window size
  // Declare shared variables at the top so all methods can access them
  this.score = 0;
  this.scoreText
  this.platforms
  this.diamonds
  this.rocks
  this.stars
  this.cursors
  this.player
  this.playerAlive;
  this.pause_label
  this.menu
  this.deathText
  this.fallLedges;
  this.falsePlatforms;
  this.slowPlatforms;
  this.jumpPlatforms;
  this.liveTimer;
  this.musicg;
  this.jumpfx;
  this.background;
}

ProtoGame.State.prototype =
{
  preload: function ()  {
    // Load & Define our game assets
    this.game.stage.backgroundColor = '#00FFFF';
    this.game.load.image('sky', 'Assets/sky.png');
    this.game.load.image('ground', 'Assets/platform.png');
    this.game.load.image('breakingPlatform', 'Assets/breakingPlatform.png');
    this.game.load.image('slowPlatform', 'Assets/slowPlatform.png');
    this.game.load.image('jumpPlatform', 'Assets/jumpPlatform.png');
    this.game.load.image('rock', 'Assets/rock.png');
    this.game.load.spritesheet('star', 'Assets/star.png', 32, 32);
    this.game.load.image('diamond', 'Assets/diamond.png');
    this.game.load.spritesheet('woof', 'Assets/slime.png', 42, 33);
    this.game.load.image('menu', 'Assets/number-buttons-90x90.png', 270, 180);
    this.game.load.image('play_button', 'Assets/play_button.png');
    this.game.load.image('play_button_clicked', 'Assets/play_button_clicked.png');
    this.game.load.audio('sfx', 'Assets/sounds/jump_bit.wav');
    this.game.load.audio('music', 'Assets/sounds/gameplay_music.mp3');    
  },

  create: function () {

    //  Make the world larger than the actual canvas

      //  We're going to be using physics, so enable the Arcade Physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE)

      //  A simple background for our game
    this.background = this.game.add.tileSprite(0, 0, 6000, 6000, 'sky')
    this.background.fixedToCamera = true;

      //  The platforms group contains the ground and the 2 ledges we can jump on
    this.platforms = this.game.add.group()
    this.falsePlatforms = this.game.add.group();
    this.slowPlatforms = this.game.add.group();
    this.jumpPlatforms = this.game.add.group();

    this.rocks = this.game.add.group();
    this.stars = this.game.add.group();

      //  We will enable physics for any object that is created in this group
    this.platforms.enableBody = true
    this.falsePlatforms.enableBody = true;
    this.slowPlatforms.enableBody = true;
    this.jumpPlatforms.enableBody = true;

    this.rocks.enableBody = true;
    this.stars.enableBody = true;

      // Here we create the ground.
    this.ground = this.platforms.create(0, this.game.world.height - 64, 'ground')

      //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    this.ground.scale.setTo(3, 3)

      //  This stops it from falling away when you jump on it
    this.ground.body.immovable = true
    this.ledge;
    var lastY = 0;
    for (var i = 0; i < 3; i++)
    {
      var newY;

      if (lastY == 0) {
        newY = this.game.world.height - 500;
        lastY = newY;
      } else {
        var num = (this.game.world.randomY % 5 * -100) - i*150;
        newY = lastY + num;
        lastY = newY;
      }

      this.ledge = this.platforms.create(getRandomInt(0, width * 0.85), newY, 'ground')
      this.ledge.body.immovable = true
      this.ledge.body.checkCollision.down = false;
    }

      // The player and its settings
    this.player = this.game.add.sprite(width/2, this.game.world.height - 150, 'woof')

    this.player.anchor.setTo(0.5, 0.5);
      //  We need to enable physics on the player
    this.game.physics.arcade.enable(this.player)
      //  Player physics properties. Give the little guy a slight bounce.
    this.player.body.bounce.y = 0.2
    this.player.body.gravity.y = 4000

      //  Our two animations, walking left and right.
    this.player.animations.add('jump')

      //  Finally some diamonds to collect
    this.diamonds = this.game.add.group()

    this.diamonds.enableBody = true;

      //  Create the score text
    this.scoreText = this.game.add.text(16, 16, '', { fontSize: '32px', fill: '#000', align: "center" });
    this.scoreText.fixedToCamera = true;
    this.scoreText.text = 'Score: ' + this.score;

    this.liveTimer = 0;
    this.playerAlive = true;
      //  Create sounds
    this.jumpfx = this.game.add.audio('sfx');
    this.jumpfx.addMarker('jump_bit', 0, 1.0, 0.5,false);
    this.musicg = this.game.add.audio('music');
    this.musicg.addMarker('musicg', 0, 70.0, 0.7, true);
    //this.musicg.play();                            ////////////////////      DESCOMENTAR       ///////////////////////

      //  Adjust the camera with the player
    this.game.camera.y = this.player.y;

      //  And bootstrap our controls
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.pauseMenu();

    this.game.camera.y = this.player.y;
  },

  update:function () {
      //  We want the player to stop when not moving
    this.player.body.velocity.x = 0;

      //  Setup collisions for the player, diamonds, and our platforms
    this.game.physics.arcade.collide(this.player, this.platforms)
    this.game.physics.arcade.collide(this.player, this.falsePlatforms, this.deactivatePlatform)
    this.game.physics.arcade.collide(this.player, this.slowPlatforms)
    this.game.physics.arcade.collide(this.player, this.jumpPlatforms, this.impulsePlayer)
    this.game.physics.arcade.collide(this.player, this.rocks, this.killPlayer)
    this.game.physics.arcade.collide(this.player, this.stars, this.killPlayer)

      //  Call callectionDiamond() if player overlaps with a diamond
    this.game.physics.arcade.overlap(this.player, this.diamonds, this.collectDiamond, null, this)

      // Configure the controls!
    if (this.cursors.left.isDown) {
      this.player.body.velocity.x = -450
      this.player.scale.setTo(1, 1)

    } else if (this.cursors.right.isDown) {
      this.player.body.velocity.x = 450
      this.player.scale.setTo(-1, 1)
    }

      //  This allows the player to jump!
    if (this.player.body.touching.down) {
      if(this.player.body.velocity.y > 0){ this.player.body.velocity.y = 0 }
      this.player.body.velocity.y -= 1700
      this.player.animations.play('jump', 12, false)
      this.jumpfx.play('jump_bit',0.5);
      this.plataformSpawner();
      this.collectableSpawner();
      this.enemiesSpawner();
      this.deletePostCamera();
    }

      // World Bounds
    if(this.player.body.x > width - 42)
    {
      this.player.body.x = width - 42;
    }
    else if(this.player.body.x < 0)
    {
      this.player.body.x = 0;
    }
    if(this.player.body.y < 0)
    {
      this.player.body.y = 0;
      this.player.body.velocity.y = 0;
    }

      // World movement
    this.background.tilePosition.y -= 5;
    if(this.player.body.velocity.y < 0){
      this.platforms.forEach(platform => {
        platform.body.velocity.y = 400;
      });
      this.falsePlatforms.forEach(platform => {
        platform.body.velocity.y = 400;
      });
      this.slowPlatforms.forEach(platform => {
        platform.body.velocity.y = 300;
      });
      this.jumpPlatforms.forEach(platform => {
        platform.body.velocity.y = 500;
      });

    }

    if(this.game.time.totalElapsedSeconds() - this.liveTimer >= 0.5 && this.playerAlive == true)
    {
      this.liveTimer = this.game.time.totalElapsedSeconds();
      this.score += 5
      this.scoreText.text = 'Score: ' + this.score
    }
      // Player death outside camera
    if  (this.player.y > height)
    {
      this.playerAlive = false;
      this.deathText = this.game.add.text(width * 0.42, height * 0.42, 'You Died', { fontSize: '32px', fill: '#000', align: "center" });
      this.deathText.fixedToCamera = true;
      this.musicg.destroy = true;
      this.jumpfx.destroy = true;
      this.gameOver();
    }
  }, 

  mainMenu: function() {
    button = game.add.button(game.world.centerX - 95, 400, 'play_button', actionOnClick, this, 2, 1, 0);
  },

  actionOnClick: function(){

  },

  deactivatePlatform: function(player, ledge) {
    ledge.body.immovable = false;
    ledge.body.gravity.y = 10000;
  },

  impulsePlayer: function(player, ledge) {
    player.body.velocity.y -= 1900;
  },

  killPlayer: function (player, enemy) {
    player.body.y += 10000;
  },

  plataformSpawner: function () {
    platType = getRandomInt(0, 10);
    if(platType >= 0 && platType < 5)
    {
      newPlat = this.platforms.create(getRandomInt(0, width * 0.85), game.camera.y - 40, 'ground');
      newPlat.body.immovable = true;
      newPlat.body.checkCollision.down = false;
      newPlat.body.checkCollision.left = false;
      newPlat.body.checkCollision.right = false;
      newPlat.scale.setTo(getRandomInt(20, 85) / 100, 1);
    }
    else if(platType >= 5 && platType < 8)
    {
      newPlat = this.falsePlatforms.create(getRandomInt(0, width * 0.85), game.camera.y - 40, 'breakingPlatform');
      newPlat.body.immovable = true;
      newPlat.body.checkCollision.down = false;
      newPlat.body.checkCollision.left = false;
      newPlat.body.checkCollision.right = false;
      newPlat.scale.setTo(getRandomInt(20, 85) / 100, 1);
    }
    else if(platType == 8 || platType == 9)
    {
      newPlat = this.slowPlatforms.create(getRandomInt(0, width * 0.85), game.camera.y - 40, 'slowPlatform');
      newPlat.body.immovable = true;
      newPlat.body.checkCollision.down = false;
      newPlat.body.checkCollision.left = false;
      newPlat.body.checkCollision.right = false;
      newPlat.scale.setTo(getRandomInt(20, 85) / 100, 1);
    }
    else if(platType == 10)
    {
      newPlat = this.jumpPlatforms.create(getRandomInt(0, width * 0.85), game.camera.y - 40, 'jumpPlatform');
      newPlat.body.immovable = true;
      newPlat.body.checkCollision.down = false;
      newPlat.body.checkCollision.left = false;
      newPlat.body.checkCollision.right = false;
      newPlat.scale.setTo(getRandomInt(20, 85) / 100, 1);
    }
  },

  collectableSpawner: function () {
    if(getRandomInt(1, 100) >= 85)
    {
      diamond = this.diamonds.create(getRandomInt(0, width * 0.85), game.camera.y - 100, 'diamond')
      diamond.body.velocity.y = 300;
    }
  },

  enemiesSpawner: function () {
    if(getRandomInt(1, 100) >= 70)
    {
      rock = this.rocks.create(getRandomInt(0, width * 0.85), game.camera.y - 120, 'rock')
      rock.body.velocity.y = 300;
      rock.scale.setTo(0.25, 0.25)
    }
    if(getRandomInt(1,100) >= 80)
    {
      pickSide = getRandomInt(0, 1)
      xPos = 0
      if(pickSide == 0) xPos = -75;
      else xPos = width + 50;
      star = this.stars.create(xPos, getRandomInt(0, height * 0.9), 'star')
      star.animations.add('spin')
      if(pickSide == 0)
      { 
        star.animations.play('spin', 10, true);
        star.body.velocity.x = 300;
        star.body.velocity.y = 300;
      }
      else 
      {
        star.animations.play('spin', 10, true); star.scale.setTo(-1, 1); 
        star.body.velocity.x = -300;
        star.body.velocity.y = 300;
      }
      
      star.scale.setTo(1.2, 1.2)
    }
  },

  deletePostCamera: function()
  {
    this.platforms.forEach(platform => {
      if(platform.y > this.game.camera.y + height) { platform.kill() }
    });
    this.falsePlatforms.forEach(platform => {
      if(platform.y > this.game.camera.y + height) { platform.kill() }
    });
    this.slowPlatforms.forEach(platform => {
      if(platform.y > this.game.camera.y + height) { platform.kill() }
    });
    this.jumpPlatforms.forEach(platform => {
      if(platform.y > this.game.camera.y + height) { platform.kill() }
    });

    this.diamonds.forEach(diamond => {
      if(diamond.y > this.game.camera.y + height) { diamond.kill() }
    });

    this.rocks.forEach(rock => {
      if(rock.y > this.game.camera.y + height) { rock.kill() }
    });
    this.stars.forEach(star => {
      if(star.y > this.game.camera.y + height) { star.kill() }
    });
  },

  pauseGame: function() {
    game.paused = true;
    // Then add the menu
    menu = game.add.sprite(width / 2, game.camera.y + 400, 'menu');
    menu.fixedToCamera = true;
    menu.anchor.setTo(0.5, 0.5);

    // And a label to illustrate which menu item was chosen. (This is not necessary)
    choiseLabel = game.add.text(width / 2, game.camera.y + 600, 'Click outside menu to continue', { font: '30px Arial', fill: '#fff' });
    choiseLabel.fixedToCamera = true;
    choiseLabel.anchor.setTo(0.5, 0.5);
  },

  // And finally the method that handels the pause menu
  unpause: function(event){
    // Only act if paused
    if(game.paused){
        // Calculate the corners of the menu
        var x1 = width / 2 - 270 / 2, x2 = width / 2 + 270 / 2,
            y1 = height / 2 - 180 / 2, y2 = height / 2 + 180 / 2;

        // Check if the click was inside the menu
        if(event.x > x1 && event.x < x2 && event.y > y1 && event.y < y2 ){
            // The choicemap is an array that will help us see which item was clicked
            var choisemap = ['one', 'two', 'three', 'four', 'five', 'six'];

            // Get menu local coordinates for the click
            var x = event.x - x1,
                y = event.y - y1;

            // Calculate the choice 
            var choise = Math.floor(x / 90) + 3*Math.floor(y / 90);

            // Display the choice
            this.choiseLabel.text = 'You chose menu item: ' + choisemap[choise];
        }
        else{
            // Remove the menu and the label
            menu.destroy();
            choiseLabel.destroy();

            // Unpause the game
            game.paused = false;
        }
    }
  },

  pauseMenu:function () {
    // Create a label to use as a button
    this.pause_label = this.game.add.text(width*0.85, height*0.02, 'Pause', {align: 'center', font: '24px Arial', fill: '#fff' });
    this.pause_label.fixedToCamera = true;
    this.pause_label.inputEnabled = true;
    
    // When the pause button is pressed, we pause the game
    this.pause_label.events.onInputUp.add(this.pauseGame);

    // Add a input listener that can help us return from being paused
    this.game.input.onDown.add(this.unpause, self);
  },

  collectDiamond:  function (player, diamond) {
      // Removes the diamond from the screen
      diamond.kill()

      //  And update the score
      this.score += 300
      this.scoreText.text = 'Score: ' + this.score
  },


  gameOver: function()   
  {
    this.player.kill();

    this.platforms.forEach(platform => {platform.kill()});
    this.falsePlatforms.forEach(platform => {platform.kill()});
    this.slowPlatforms.forEach(platform => {platform.kill()});
    this.jumpPlatforms.forEach(platform => {platform.kill()});

    this.diamonds.forEach(diamond => {diamond.kill()});

    this.rocks.forEach(rock => {rock.kill()});
    this.stars.forEach(star => {star.kill()});

    this.musicg.stop();
    this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.label = this.game.add.text(width / 2 , height / 2, 'Score: '+this.score+'\nGAME OVER\nPress SPACE to restart',{ font: '22px Lucida Console', fill: '#fff', align: 'center'}); 
    this.label.fixedToCamera = true;   
    this.label.anchor.setTo(0.5, 0.5); 
    this.background.tilePosition.y += 5;
      this.platforms.forEach(platform => {
        platform.body.velocity.y = 0;
      });
      this.falsePlatforms.forEach(platform => {
        platform.body.velocity.y = 0;
      });
    if(this.spaceKey.isDown)
    {
      this.restart();
    }
  },

  restart: function() 
  {
    this.score = 0; 
    this.game.state.start('State'); 
    
  },
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const game = new Phaser.Game(width, height, Phaser.CANVAS, 'Ball To The Top');

game.state.add('State', ProtoGame.State);

game.state.start('State');