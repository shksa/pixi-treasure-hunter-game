import React from 'react'
import * as PIXI from 'pixi.js'
import * as s from './style'
import { 
  randomNumberInBetween, contain, Direction, 
  hitTestRectangle, keyboard, DirectionKeys 
} from './helpers';

export interface Sprite extends PIXI.Sprite {
  vx: number
  vy: number
  centerX: number
  centerY: number
  halfWidth: number
  halfHeight: number
}

const SpriteID = {
  door: 'door.png',
  treasure: 'treasure.png',
  explorer: 'explorer.png',
  dungeon: 'dungeon.png',
  blob: 'blob.png'
}
interface AllSprites {
  [x: string]: Array<Sprite> | Sprite
  blobs: Array<Sprite>
  door: Sprite,
  treasure: Sprite,
  explorer: Sprite,
  dungeon: Sprite,
}

interface HealthBarContainer extends PIXI.Container {
  outer: PIXI.Graphics
}

export interface AreaDims {
  x: number
  y: number
  width: number
  height: number
}

export default class TreasureHunter extends React.Component {
  pixiViewWrapperEle!: HTMLDivElement
  pixiApp!: PIXI.Application
  pixiLoader = PIXI.loader
  allSprites = {} as AllSprites
  gameTextures!: PIXI.loaders.TextureDictionary
  gameState!: (deltaTime: number) => void
  playScene!: PIXI.Container
  gameOverScene!: PIXI.Container
  healthBarContainer!: HealthBarContainer
  movablePlaySceneAreaDims!: AreaDims
  gameOverSceneMessage!: PIXI.Text
  GAME_WIDTH = 1280
  GAME_HEIGHT = 720
  NumberOfBlobs = 100
  DungeonWallWidth = 80
  HealthBarWidth = 200
  HealthBarHeight = 15

  resize = () => {
    // Determine which screen dimension is most constrained
    const ratio = Math.min(window.innerWidth/this.GAME_WIDTH, window.innerHeight/this.GAME_HEIGHT)

    // Scale the view appropriately to fill that dimension
    this.pixiApp.stage.scale.x = this.pixiApp.stage.scale.y = ratio

    // Update the renderer dimensions
    this.pixiApp.renderer.resize(Math.ceil(this.GAME_WIDTH * ratio), Math.ceil(this.GAME_HEIGHT * ratio))

    console.log("Resize\n" +"  Window inner " + window.innerWidth + "," + window.innerHeight +
    " pixel ratio " + window.devicePixelRatio + "\n" +"  Renderer " + this.pixiApp.renderer.width + "," +
    this.pixiApp.renderer.height + " res " + this.pixiApp.renderer.resolution + "\n" +"  Scale " + this.pixiApp.stage.scale.x + "," + this.pixiApp.stage.scale.y + "\n")
  }

  setupGame = () => {
    // The application will create a renderer using WebGL, if possible,
    // with a fallback to a canvas render.
    // It will also setup the ticker and the root stage PIXI.Container
    this.pixiApp = new PIXI.Application({
      width: this.GAME_WIDTH, height: this.GAME_HEIGHT, backgroundColor: 0x56a4b7, autoResize: true,
      resolution: window.devicePixelRatio, antialias: true,
    })
    this.pixiApp.renderer.view.style.position = 'absolute'
    this.pixiApp.renderer.view.style.top = '0px'
    this.pixiApp.renderer.view.style.left = '0px'
    this.resize()
    this.pixiViewWrapperEle.appendChild(this.pixiApp.view)
    window.addEventListener('resize', this.resize)
    this.pixiLoader
      .add({name: 'GameTextureAtlas', url: `${process.env.PUBLIC_URL}/game-assets/pixi-treasure-hunter-game.json`})
      .load(this.setupGameScenes)
  }

  setupGameScenes = (loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
    this.playScene = new PIXI.Container()
    this.gameOverScene = new PIXI.Container()
    this.gameOverScene.visible = false
    
    this.setupPlayGameScene(resources)
    this.setupGameOverScene()

    this.gameState = this.play
    this.pixiApp.ticker.add(this.gameLoop)
  }

  setupPlayGameScene = (resources: PIXI.loaders.ResourceDictionary) => {
    this.gameTextures = resources.GameTextureAtlas.textures as PIXI.loaders.TextureDictionary

    this.createSpriteAndAddToPlayScene(SpriteID.dungeon, 0, 0)
    this.allSprites.dungeon.width = this.GAME_WIDTH
    this.allSprites.dungeon.height = this.GAME_HEIGHT
    
    this.createSpriteAndAddToPlayScene(SpriteID.explorer)
    this.allSprites.explorer.x = this.DungeonWallWidth
    this.allSprites.explorer.y = this.GAME_HEIGHT / 2 - this.allSprites.explorer.height / 2
    this.allSprites.explorer.vx = 0
    this.allSprites.explorer.vy = 0
    this.bindKeyboardArrowKeysToExplorerMoves()
    
    this.createSpriteAndAddToPlayScene(SpriteID.treasure)
    this.allSprites.treasure.x = this.GAME_WIDTH - this.allSprites.treasure.width - this.DungeonWallWidth
    this.allSprites.treasure.y = this.GAME_HEIGHT / 2 - this.allSprites.treasure.height / 2

    this.createSpriteAndAddToPlayScene(SpriteID.door, this.DungeonWallWidth, 0)

    this.createBlobSprites(SpriteID.blob)

    this.createHealthBar()

    this.movablePlaySceneAreaDims = {
      x: this.DungeonWallWidth, y: 20, 
      width: this.GAME_WIDTH - this.DungeonWallWidth, height: this.GAME_HEIGHT - 40
    }

    this.pixiApp.stage.addChild(this.playScene)
  }

  createSpriteAndAddToPlayScene = (spriteID: string, x?: number, y?: number, ) => {
    const sprite = new PIXI.Sprite(this.gameTextures[spriteID]) as Sprite
    if (typeof x === 'number' && typeof y === 'number') {
      sprite.x = x
      sprite.y = y
    }
    const spriteName = spriteID.substring(0, spriteID.length-4)
    this.allSprites[spriteName] = sprite
    this.playScene.addChild(sprite)
  }

  bindKeyboardArrowKeysToExplorerMoves = () => {
    // Capture the keyboard arrow keys
    const left = keyboard(DirectionKeys.ArrowLeft),
          up = keyboard(DirectionKeys.ArrowUp),
          right = keyboard(DirectionKeys.ArrowRight),
          down = keyboard(DirectionKeys.ArrowDown)

    const {explorer} = this.allSprites
    
    // Left arrow key `press` method
    left.press = () => {
      //Change the husky's velocity when the key is pressed
      explorer.vx = -5
      explorer.vy = 0;
    }

     // Left arrow key `release` method
    left.release = () => {
      // If the left arrow has been released, and the right arrow isn't down,
      // and the husky isn't moving vertically:
      // Stop the husky
      if (!right.isDown && explorer.vy === 0) {
        explorer.vx = 0
      }
    }

    // Up
    up.press = () => {
      explorer.vy = -5
      explorer.vx = 0
    }
    up.release = () => {
      if (!down.isDown && explorer.vx === 0) {
        explorer.vy = 0
      }
    }
    // Right
    right.press = () => {
      explorer.vx = 5
      explorer.vy = 0
    }
    right.release = () => {
      if (!left.isDown && explorer.vy === 0) {
        explorer.vx = 0
      }
    }
    // Down
    down.press = () => {
      explorer.vy = 5
      explorer.vx = 0
    }
    down.release = () => {
      if (!up.isDown && explorer.vx === 0) {
        explorer.vy = 0
      }
    }
  }

  createBlobSprites = (spriteID: string) => {
    const blobSpritesArray = Array.from({length: this.NumberOfBlobs}) as Array<Sprite>
    blobSpritesArray.forEach((_, idx, array) => {
      const blobSprite = new PIXI.Sprite(this.gameTextures[spriteID]) as Sprite
      array[idx] = blobSprite
    })
    this.allSprites.blobs = blobSpritesArray
    this.positionBlobsRandomly()
  }

  positionBlobsRandomly = () => {
    const offsetFromWall = this.DungeonWallWidth + 100
    const blobToblobSpacing = 50
    const speed = 2
    let direction = 1
    this.allSprites.blobs.forEach((blobSprite, idx) => {
      blobSprite.x = randomNumberInBetween(offsetFromWall, this.GAME_WIDTH - offsetFromWall)
      blobSprite.y = randomNumberInBetween(0, this.GAME_HEIGHT - blobSprite.height)
      
      //Set the blob's vertical velocity. `direction` will be either `1` or
      //`-1`. `1` means the enemy will move down and `-1` means the blob will
      //move up. Multiplying `direction` by `speed` determines the blob's
      //vertical direction
      blobSprite.vy = speed * direction

      //Reverse the direction for the next blob
      direction *= -1;

      this.playScene.addChild(blobSprite)
    })
  }

  createHealthBar = () => {
    this.healthBarContainer = new PIXI.Container() as HealthBarContainer
    
    const label = new PIXI.Text('Health', {
      fontFamily: "Futura",
      fontSize: this.HealthBarHeight,
      fill: "white"
    })
    label.position.set(0, 0)
    this.healthBarContainer.addChild(label)

    //Create the black background rectangle
    const innerBar = new PIXI.Graphics()
    innerBar.beginFill(0x000000)
    innerBar.drawRect(label.width + 10, 0, this.HealthBarWidth, this.HealthBarHeight)
    innerBar.endFill()
    this.healthBarContainer.addChild(innerBar)

    //Create the front red rectangle
    const outerBar = new PIXI.Graphics()
    outerBar.beginFill(0x00FF00)
    outerBar.drawRect(label.width + 10, 0, this.HealthBarWidth, this.HealthBarHeight)
    outerBar.endFill()
    this.healthBarContainer.addChild(outerBar)

    const healthBarXPosition = this.GAME_WIDTH - this.DungeonWallWidth - this.healthBarContainer.width
    this.healthBarContainer.position.set(healthBarXPosition, 4)
    this.healthBarContainer.outer = outerBar
    this.playScene.addChild(this.healthBarContainer)
  }

  setupGameOverScene = () => {
    const background = new PIXI.Graphics()
    background.beginFill(0x058635)
    background.drawRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT)
    background.endFill()
    this.gameOverScene.addChild(background)
    
    const style = new PIXI.TextStyle({
      fontFamily: "Futura",
      fontSize: 64,
      fill: "white"
    })
    this.gameOverSceneMessage = new PIXI.Text('The End!', style)
    this.gameOverSceneMessage.x = this.GAME_WIDTH / 2 - this.gameOverSceneMessage.width / 2
    this.gameOverSceneMessage.y = this.GAME_HEIGHT / 2 - this.gameOverSceneMessage.height / 2
    this.gameOverScene.addChild(this.gameOverSceneMessage)

    this.pixiApp.stage.addChild(this.gameOverScene)
  }

  gameLoop = (deltaTime: number) => {
    this.gameState(deltaTime)
  }

  play = (deltaTime: number) => {
    //Move the explorer and contain it inside the dungeon
    //Move the blob monsters
    //Check for a collision between the blobs and the explorer
    //Check for a collision between the explorer and the treasure
    //Check for a collision between the treasure and the door
    //Decide whether the game has been won or lost
    //Change the game `state` to `end` when the game is finished
    const {blobs, explorer, treasure, door} = this.allSprites
    
    explorer.x += explorer.vx
    explorer.y += explorer.vy

    contain(explorer, this.movablePlaySceneAreaDims)

    let isExplorerHit = false
    
    blobs.forEach((blob) => {
      //Move the blob
      blob.y += blob.vy

      //Check the blob's screen boundaries
      let blobHitsWall = contain(blob, this.movablePlaySceneAreaDims)

      //If the blob hits the top or bottom of the stage, reverse
      //its direction
      if (blobHitsWall === Direction.top || blobHitsWall === Direction.bottom) {
        blob.vy *= -1
      }

      //Test for a collision. If any of the enemies are touching
      //the explorer, set `explorerHit` to `true`
      if(hitTestRectangle(explorer, blob)) {
        isExplorerHit = true;
      }
    })
    if(isExplorerHit) {
      //Make the explorer semi-transparent
      explorer.alpha = 0.5
      //Reduce the width of the health bar's inner rectangle by 1 pixel
      this.healthBarContainer.outer.width -= 1
      //reset
    } else {
      //Make the explorer fully opaque (non-transparent) if it hasn't been hit
      explorer.alpha = 1
    }

    if (hitTestRectangle(explorer, treasure)) {
      treasure.x = explorer.x + 8
      treasure.y = explorer.y + 8
    }

    if (hitTestRectangle(treasure, door)) {
      this.gameState = this.end
      this.gameOverSceneMessage.text = "You won!"
    }

    if (this.healthBarContainer.outer.width < 0) {
      this.gameState = this.end
      this.gameOverSceneMessage.text = "You lost!"
    }
  }

  end = (deltaTime: number) => {
    this.playScene.visible = false
    this.gameOverScene.visible = true
  }

  componentDidMount = () => {
    if (this.pixiViewWrapperEle) {
      this.setupGame()
    }
  }

  render() {
    return (
      <s.Page>
        <s.PixiViewWrapper ref={((pixiViewWrapperEle: HTMLDivElement) => {this.pixiViewWrapperEle = pixiViewWrapperEle})}>
        </s.PixiViewWrapper>
      </s.Page>
    )
  }
}