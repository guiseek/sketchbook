import { Object3D } from 'three'
import { Path } from './path'

export class PathNode {
  object: Object3D
  nextNode: PathNode
  previousNode: PathNode

  constructor(child: THREE.Object3D, public path: Path) {
    this.object = child
  }
}
