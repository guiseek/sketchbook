import { PathNode } from './path-node'

export class Path {
  nodes: { [nodeName: string]: PathNode } = {}
  private rootNode: THREE.Object3D

  constructor(root: THREE.Object3D) {
    this.rootNode = root

    this.rootNode.traverse((child) => {
      this.addNode(child)
    })

    this.connectNodes()
  }

  addNode(child: any) {
    if (
      child.hasOwnProperty('userData') &&
      child.userData.hasOwnProperty('data')
    ) {
      if (child.userData.data === 'pathNode') {
        let node = new PathNode(child, this)
        this.nodes[child.name] = node
      }
    }
  }

  connectNodes() {
    for (const nodeName in this.nodes) {
      if (this.nodes.hasOwnProperty(nodeName)) {
        const node = this.nodes[nodeName]
        node.nextNode = this.nodes[node.object.userData.nextNode]
        node.previousNode = this.nodes[node.object.userData.previousNode]
      }
    }
  }
}
