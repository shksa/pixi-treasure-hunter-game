import { Sprite, AreaDims } from ".";

export const randomNumberInBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export enum Direction {
  left = 'left',
  right = 'right',
  top = 'top',
  bottom = 'bottom'
}

export const contain = (sprite: Sprite, container: AreaDims): Direction | undefined => {

  let collision : undefined | Direction = undefined

  //Left
  if (sprite.x < container.x) {
    sprite.x = container.x;
    collision = Direction.left
  }

  //Top
  if (sprite.y < container.y) {
    sprite.y = container.y;
    collision = Direction.top
  }

  //Right
  if (sprite.x + sprite.width > container.width) {
    sprite.x = container.width - sprite.width;
    collision = Direction.right
  }

  //Bottom
  if (sprite.y + sprite.height > container.height) {
    sprite.y = container.height - sprite.height;
    collision = Direction.bottom
  }

  //Return the `collision` value
  return collision;
}

export const hitTestRectangle = (r1: Sprite, r2: Sprite): boolean => {
  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //hit will determine whether there's a collision
  hit = false;

  //Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {

    //A collision might be occurring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {

      //There's definitely a collision happening
      hit = true;
    } else {

      //There's no collision on the y axis
      hit = false;
    }
  } else {

    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
}

export enum DirectionKeys {
  ArrowUp = "ArrowUp",
  ArrowDown = "ArrowDown",
  ArrowLeft = "ArrowLeft",
  ArrowRight = "ArrowRight",
}

export interface KeyObject {
  value: DirectionKeys
  isDown: boolean
  isUp: boolean
  press: (() => void) | undefined
  release: (() => void) | undefined
  downHandler: (event: KeyboardEvent) => void
  upHandler: (event: KeyboardEvent) => void
  unsubscribe: () => void
}

export const keyboard = (value: DirectionKeys) => {
  let key = {} as KeyObject
  key.value = value
  key.isDown = false
  key.isUp = true
  key.press = undefined
  key.release = undefined

  //The `downHandler`
  key.downHandler = (event) => {
    if (event.key === key.value) {
      // console.log(`event.key: ${event.key}, key.value: ${key.value} downHandler`)
      if (key.isUp && key.press) key.press()
      key.isDown = true
      key.isUp = false
      event.preventDefault()
    }
  }

  //The `upHandler`
  key.upHandler = (event) => {
    if (event.key === key.value) {
      // console.log(`event.key: ${event.key}, key.value: ${key.value} upHandler`)
      if (key.isDown && key.release) key.release()
      key.isDown = false
      key.isUp = true
      event.preventDefault()
    }
  }

  //Attach event listeners
  const downListener = key.downHandler
  const upListener = key.upHandler
  
  document.addEventListener(
    "keydown", downListener, false
  )
  document.addEventListener(
    "keyup", upListener, false
  )
  
  // Detach event listeners
  key.unsubscribe = () => {
    document.removeEventListener("keydown", downListener)
    document.removeEventListener("keyup", upListener)
  }
  
  return key
}