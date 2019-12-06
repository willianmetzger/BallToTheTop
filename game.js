let ProtoGame = {};
ProtoGame.State = function (game){
  //import Player from "./Classes/Player"

  let width = 600;
  let height = 800;

  // Initialize the Phaser Game object and set default game window size
  const game = new Phaser.Game(width, height, Phaser.CANVAS, 'Ball To The Top', {
    preload: preload,
    create: create,
    update: update })

  // Declare shared variables at the top so all methods can access them
  let score = 0;
  let meters = 0;
  let scoreText
  let platforms
  let diamonds
  let cursors
  let player
  let pause_label
  let menu
  let deathText
}


ProtoGame.State.prototype =
{
  preload: function ()  {
    // Load & Define our game assets
    game.stage.backgroundColor = '#00FFFF';
    game.load.image('sky', 'Assets/sky.png');
    game.load.image('ground', 'Assets/platform.png');
    game.load.image('diamond', 'Assets/diamond.png');
    game.load.spritesheet('woof', 'Assets/woof.png', 32, 32);
    game.load.image('menu', 'Assets/number-buttons-90x90.png', 270, 180);
    game.load.audio('sfx', 'Assets/sounds/jump_bit.wav');
    //player = new Player(game)
  },

  create: function () {

    //  Make the world larger than the actual canvas
    game.world.setBounds(0, 0, 0, 3000);

      //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE)

      //  A simple background for our game
    game.add.tileSprite(0, 0, 3000, 3000, 'sky')

      //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group()

      //  We will enable physics for any object that is created in this group
    platforms.enableBody = true

      // Here we create the ground.
    let ground = platforms.create(0, game.world.height - 64, 'ground')

      //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(3, 3)

      //  This stops it from falling away when you jump on it
    ground.body.immovable = true
    let ledge;
    for (var i = 0; i < 30; i++)
    {
      ledge = platforms.create(game.world.randomX, game.world.randomY, 'ground')
      ledge.body.immovable = true
      ledge.body.checkCollision.down = false;
    }
      //  Now let's create two ledges
    // let ledge = platforms.create(400, 450, 'ground')
    // ledge.body.immovable = true

    // ledge = platforms.create(-75, 350, 'ground')
    // ledge.body.immovable = false

      // The player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'woof')

    player.anchor.setTo(0.5, 0.5);
      //  We need to enable physics on the player
    game.physics.arcade.enable(player)
      //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.2
    player.body.gravity.y = 800
    player.body.collideWorldBounds = true

      //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1], 10, true)
    player.animations.add('right', [2, 3], 10, true)

      //  Finally some diamonds to collect
    diamonds = game.add.group()

      //  Enable physics for any object that is created in this group
    diamonds.enableBody = true

      //  Create 12 diamonds evenly spaced apart
    for (var i = 0; i < 12; i++) {
      let diamond = diamonds.create(i * 70, 0, 'diamond')

        //  Drop em from the sky and bounce a bit
      diamond.body.gravity.y = 1000
      diamond.body.bounce.y = 0.3 + Math.random() * 0.2
    }

      //  Create the score text
    scoreText = game.add.text(16, 16, '', { fontSize: '32px', fill: '#000', align: "center" });
    scoreText.fixedToCamera = true;
    scoreText.text = 'Score: ' + score;
    //scoreText.cameraOffset.setTo(200, 500);

    // Create sounds
    fx = game.add.audio('sfx');

    fx.addMarker('jump_bit', 0, 1.0);

    game.camera.y = player.y;

      //  And bootstrap our controls
    cursors = game.input.keyboard.createCursorKeys();
    pauseMenu();

    game.camera.y = player.y;
  },

  update:function () {
      //  We want the player to stop when not moving
    player.body.velocity.x = 0

    //game.camera.speed = -2;

      //  Setup collisions for the player, diamonds, and our platforms
    game.physics.arcade.collide(player, platforms)
    game.physics.arcade.collide(diamonds, platforms)

      //  Call callectionDiamond() if player overlaps with a diamond
    game.physics.arcade.overlap(player, diamonds, collectDiamond, null, this)

      // Configure the controls!
    if (cursors.left.isDown) {
      player.body.velocity.x = -150
      player.animations.play('left')

    } else if (cursors.right.isDown) {
      player.body.velocity.x = 150
      player.animations.play('right')

    } else {
      // If no movement keys are pressed, stop the player
      player.animations.stop()
    }

      //  This allows the player to jump!
    if (player.body.touching.down) {
      player.body.velocity.y = -800
      fx.play('jump_bit',0.5);
    }
      // Show an alert modal when score reaches 120
    if (score === 120) {
      alert('You win!')
      score = 0
    }

      // Camera follow
    if(player.y <= (game.camera.y + (height/2)))
    {
      game.camera.follow(player, Phaser.Camera.FOLLOW_TOPDOWN);
    }
    else
    {
      game.camera.follow(null);
    }

      // Player death outside camera
    if  (player.y > game.camera.y + height)
    {
        deathText = game.add.text(width * 0.42, height * 0.42, 'You Died', { fontSize: '32px', fill: '#000', align: "center" });
        deathText.fixedToCamera = true;
        gameOver();
    }
  },

  mainMenu: function() {
    game.state.add("")
  },

  pauseMenu:function () {
    // Create a label to use as a button
    pause_label = game.add.text(width*0.85, height*0.02, 'Pause', {align: 'center', font: '24px Arial', fill: '#fff' });
    pause_label.fixedToCamera = true;
    pause_label.inputEnabled = true;
    pause_label.events.onInputUp.add(function () {
        // When the paus button is pressed, we pause the game
        game.paused = true;

        // Then add the menu
        menu = game.add.sprite(width / 2, height / 2, 'menu');
        menu.fixedToCamera = true;
        menu.anchor.setTo(0.5, 0.5);

        // And a label to illustrate which menu item was chosen. (This is not necessary)
        choiseLabel = game.add.text(width / 2, height - 150, 'Click outside menu to continue', { font: '30px Arial', fill: '#fff' });
        choiseLabel.fixedToCamera = true;
        choiseLabel.anchor.setTo(0.5, 0.5);
    });

    // Add a input listener that can help us return from being paused
    game.input.onDown.add(unpause, self);

    // And finally the method that handels the pause menu
    function unpause(event){
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
              choiseLabel.text = 'You chose menu item: ' + choisemap[choise];
          }
          else{
              // Remove the menu and the label
              menu.destroy();
              choiseLabel.destroy();

              // Unpause the game
              game.paused = false;
          }
      }
    };
  },

  collectDiamond: function (player, diamond) {
      // Removes the diamond from the screen
    diamond.kill()

      //  And update the score
    score += 10
    scoreText.text = 'Score: ' + score
  },


  gameOver: function()   
  {
    player.kill();
    this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    label = game.add.text(width / 2 , height / 2, 'Score: '+score+'\nGAME OVER\nPress SPACE to restart',{ font: '22px Lucida Console', fill: '#fff', align: 'center'}); 
    label.fixedToCamera = true;   
    label.anchor.setTo(0.5, 0.5);  
    if(this.spaceKey.isDown)
    {
      restart();
      
    }
  },

  restart: function() 
  {
    score = 0; 
    create(); 
  }
};