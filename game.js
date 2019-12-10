let width = 600;
let height = 800;
this.ProtoGame = {};
this.GameMenu ={};

ProtoGame.State = function (game){
  //import Player from "./Classes/Player"
  
  // Initialize the Phaser Game object and set default game window size
  // Declare shared variables at the top so all methods can access them
  this.score = 0;
  this.meters = 0;
  this.scoreText
  this.platforms
  this.diamonds
  this.cursors
  this.player
  this.playerLastPos = 0;
  this.pause_label
  this.menu
  this.deathText
  this.fallLedges;
  this.falsePlatforms;
  this.screenObjects = new Array;
  this.minY = 100;
  this.minX = 100;
  this.musicg;
  this.jumpfx;
}

ProtoGame.State.prototype =
{
  preload: function ()  {
    // Load & Define our game assets
    this.game.stage.backgroundColor = '#00FFFF';
    this.game.load.image('sky', 'Assets/sky.png');
    this.game.load.image('ground', 'Assets/platform.png');
    this.game.load.image('breakingPlatform', 'Assets/breakingPlatform.png');
    this.game.load.image('diamond', 'Assets/diamond.png');
    this.game.load.spritesheet('woof', 'Assets/woof.png', 32, 32);
    this.game.load.image('menu', 'Assets/number-buttons-90x90.png', 270, 180);
    this.game.load.image('play_button', 'Assets/play_button.png');
    this.game.load.image('play_button_clicked', 'Assets/play_button_clicked.png');
    this.game.load.audio('sfx', 'Assets/sounds/jump_bit.wav');
    this.game.load.audio('music', 'Assets/sounds/gameplay_music.mp3');
    //player = new Player(game);

    
  },

  create: function () {

    //  Make the world larger than the actual canvas
    //this.game.world.setBounds(0, 0, 0, 6000);

      //  We're going to be using physics, so enable the Arcade Physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE)

      //  A simple background for our game
    this.game.add.tileSprite(0, 0, 6000, 6000, 'sky')

      //  The platforms group contains the ground and the 2 ledges we can jump on
    this.platforms = this.game.add.group()
    this.falsePlatforms = this.game.add.group();

      //  We will enable physics for any object that is created in this group
    this.platforms.enableBody = true
    this.falsePlatforms.enableBody = true;

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
        newY = this.game.world.height - 250;
        lastY = newY;
        //console.log('aaaa');
      } else {
        var num = (this.game.world.randomY % 3 * -100);
        //console.log(num)
        newY = lastY + num;
        // while((newY - lastY) > this.minY) {
        //   newY = this.game.world.randomY
        // }
        lastY = newY;
      }

      this.ledge = this.platforms.create(this.game.world.randomX, newY, 'ground')
      this.ledge.body.immovable = true
      this.ledge.body.checkCollision.down = false;
    }

    // this.ledge = this.platforms.create(-75, 350, 'ground')
    // this.ledge.body.immovable = false

    // for (var i = 0; i < 50; i++) {
    //   this.fallLedges = this.falsePlatforms.create(this.game.world.randomX, this.game.world.randomY, 'breakingPlatform');
    //   this.fallLedges.body.immovable = true;
    //   this.fallLedges.body.checkCollision.down = false;
    //   //this.fallLedges.body.tint = 0xff00ff;
    // }
      // The player and its settings
    this.player = this.game.add.sprite(32, this.game.world.height - 150, 'woof')

    this.player.anchor.setTo(0.5, 0.5);
      //  We need to enable physics on the player
    this.game.physics.arcade.enable(this.player)
      //  Player physics properties. Give the little guy a slight bounce.
    this.player.body.bounce.y = 0.2
    this.player.body.gravity.y = 800
    this.player.body.collideWorldBounds = true

      //  Our two animations, walking left and right.
    this.player.animations.add('left', [0, 1], 10, true)
    this.player.animations.add('right', [2, 3], 10, true)

      //  Finally some diamonds to collect
    this.diamonds = this.game.add.group()

      //  Enable physics for any object that is created in this group
    this.diamonds.enableBody = true

      //  Create 12 diamonds evenly spaced apart
    for (var i = 0; i < 12; i++) {
      this.diamond = this.diamonds.create(i * 70, 0, 'diamond')

        //  Drop em from the sky and bounce a bit
      this.diamond.body.gravity.y = 1000
      this.diamond.body.bounce.y = 0.3 + Math.random() * 0.2
    }

      //  Create the score text
    this.scoreText = this.game.add.text(16, 16, '', { fontSize: '32px', fill: '#000', align: "center" });
    this.scoreText.fixedToCamera = true;
    this.scoreText.text = 'Score: ' + this.score;
    //scoreText.cameraOffset.setTo(200, 500);

      //  Create sounds
    this.jumpfx = this.game.add.audio('sfx');
    this.jumpfx.addMarker('jump_bit', 0, 1.0, 0.5,false);
    this.musicg = this.game.add.audio('music');
    this.musicg.addMarker('musicg', 0, 70.0, 0.7, true);
    this.musicg.play();

      //  Adjust the camera with the player
    this.game.camera.y = this.player.y;

      //  And bootstrap our controls
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.pauseMenu();

    this.game.camera.y = this.player.y;

    this.playerLastPos = this.player.y;
  },

  update:function () {
      //  We want the player to stop when not moving
    this.player.body.velocity.x = 0;

    //game.camera.speed = -2;

      //  Setup collisions for the player, diamonds, and our platforms
    this.game.physics.arcade.collide(this.player, this.platforms, this.triggerColEvent)
    this.game.physics.arcade.collide(this.player, this.falsePlatforms, this.deactivatePlatform)
    this.game.physics.arcade.collide(this.diamonds, this.platforms)
    this.game.physics.arcade.collide(this.diamonds, this.falsePlatforms)

      //  Call callectionDiamond() if player overlaps with a diamond
    this.game.physics.arcade.overlap(this.player, this.diamonds, this.collectDiamond, null, this)

      // Configure the controls!
    if (this.cursors.left.isDown) {
      this.player.body.velocity.x = -150
      this.player.animations.play('left')

    } else if (this.cursors.right.isDown) {
      this.player.body.velocity.x = 150
      this.player.animations.play('right')

    } else {
      // If no movement keys are pressed, stop the player
      this.player.animations.stop()
    }

      //  This allows the player to jump!
    if (this.player.body.touching.down) {
      this.player.body.velocity.y = -800
      this.jumpfx.play('jump_bit',0.5);
      this.plataformSpawner();
      this.checkPlayerHeight(this.player.y);
  
    }
      // Show an alert modal when score reaches 120
    if (this.score === 120) {
      alert('You win!')
      this.score = 0
    }

      // Camera follow
    if(this.player.y <= (this.game.camera.y + (height/2)))
    {
      this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_TOPDOWN);
    }
    else
    {
      this.game.camera.follow(null);
    }

      // Player death outside camera
    if  (this.player.y > this.game.camera.y + height)
    {
      this.deathText = this.game.add.text(width * 0.42, height * 0.42, 'You Died', { fontSize: '32px', fill: '#000', align: "center" });
      this.deathText.fixedToCamera = true;
      this.musicg.destroy = true;
      this.gameOver();
    }

    //this.plataformSpawner();
    //this.checkPlayerHeight(this.player.y);
  }, 

  mainMenu: function() {
    button = game.add.button(game.world.centerX - 95, 400, 'play_button', actionOnClick, this, 2, 1, 0);
  },

  actionOnClick: function(){

  },

  deactivatePlatform: function(player, ledge) {
    //console.log('entrou');
    ledge.body.immovable = false;
    ledge.body.gravity.y = 1000;
  },

  checkPlayerHeight: function (heightplayer) {
    if(heightplayer < 300)
    {
      //this.player.y += 20 ;
    //  this.playerLastPos += 4000;
      this.platforms.y += 2;
      this.falsePlatforms.y += 2; 
    }
  },

  plataformSpawner: function () {
    if(this.player.y >= 200)
    {
     console.log(this.player.y);
      for (let index = 0; index < 2; index++) {     
        platType = getRandomInt(0, 1);
        if(platType == 0)
        {
          //newPlat = this.platforms.create(getRandomInt(0, width), this.platforms.children[this.platforms.length] - (getRandomInt(200, 300) * index), 'ground');
          newPlat = this.platforms.create(300, this.player.y-400, 'ground');
          newPlat.body.immovable = true;
          newPlat.body.checkCollision.down = false;
          newPlat.scale.setTo(getRandomFloat(0.2, 1), 1);
        }
        else
        {
          //newPlat = this.falsePlatforms.create(getRandomInt(0, width),  this.falsePlatforms.children[this.falsePlatforms.length] - (getRandomInt(200, 300) * index), 'breakingPlatform');
          newPlat = this.falsePlatforms.create(300, this.player.y-400, 'breakingPlatform');
          newPlat.body.immovable = true;
          newPlat.body.checkCollision.down = false;
          newPlat.scale.setTo(getRandomFloat(0.2, 1), 1);
        }
      }
    }
  },

  triggerColEvent: function (player, platform) {
    this.playerLastPos = player.y;
  },

  pauseGame: function() {
    game.paused = true;
    //console.log("pause");
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
      this.score += 10
      this.scoreText.text = 'Score: ' + this.score
  },


  gameOver: function()   
  {
    this.player.kill();
    this.musicg.stop();
    this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.label = this.game.add.text(width / 2 , height / 2, 'Score: '+this.score+'\nGAME OVER\nPress SPACE to restart',{ font: '22px Lucida Console', fill: '#fff', align: 'center'}); 
    this.label.fixedToCamera = true;   
    this.label.anchor.setTo(0.5, 0.5); 
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

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

const game = new Phaser.Game(width, height, Phaser.CANVAS, 'Ball To The Top');

game.state.add('State', ProtoGame.State);

game.state.start('State');