class NodeFileReader {
  result = null;
  onloadend = null;

  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }
}

globalThis.FileReader ??= NodeFileReader;

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Scene,
  SphereGeometry,
} from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { mkdir, writeFile } from "node:fs/promises";

const outputDirectory = new URL("../public/models/", import.meta.url);
const exporter = new GLTFExporter();

const materials = {
  sofa: new MeshStandardMaterial({ color: "#6d7f9a", roughness: 0.76 }),
  cushion: new MeshStandardMaterial({ color: "#8b9bb0", roughness: 0.82 }),
  wood: new MeshStandardMaterial({ color: "#5e4838", roughness: 0.62 }),
  brass: new MeshStandardMaterial({ color: "#b9955d", roughness: 0.38, metalness: 0.6 }),
  shade: new MeshStandardMaterial({ color: "#e8d9bd", roughness: 0.86 }),
  pot: new MeshStandardMaterial({ color: "#a96952", roughness: 0.72 }),
  leaf: new MeshStandardMaterial({ color: "#52775c", roughness: 0.8 }),
};

function mesh(geometry, material, position = [0, 0, 0]) {
  const object = new Mesh(geometry, material);
  object.position.set(...position);
  object.castShadow = true;
  object.receiveShadow = true;
  return object;
}

function createSofa() {
  const group = new Group();
  group.add(mesh(new BoxGeometry(2.8, 0.42, 0.92), materials.sofa, [0, 0.46, 0]));
  group.add(mesh(new BoxGeometry(2.8, 0.7, 0.25), materials.sofa, [0, 0.95, 0.34]));
  group.add(mesh(new BoxGeometry(0.22, 0.72, 0.92), materials.sofa, [-1.29, 0.64, 0]));
  group.add(mesh(new BoxGeometry(0.22, 0.72, 0.92), materials.sofa, [1.29, 0.64, 0]));
  group.add(mesh(new BoxGeometry(1.1, 0.18, 0.78), materials.cushion, [-0.58, 0.76, -0.04]));
  group.add(mesh(new BoxGeometry(1.1, 0.18, 0.78), materials.cushion, [0.58, 0.76, -0.04]));
  for (const x of [-1.12, 1.12]) {
    for (const z of [-0.32, 0.32]) group.add(mesh(new BoxGeometry(0.1, 0.48, 0.1), materials.wood, [x, 0.15, z]));
  }
  return group;
}

function createLamp() {
  const group = new Group();
  group.add(mesh(new CylinderGeometry(0.45, 0.45, 0.1, 24), materials.brass, [0, 0.05, 0]));
  group.add(mesh(new CylinderGeometry(0.06, 0.06, 1.65, 16), materials.brass, [0, 0.92, 0]));
  group.add(mesh(new CylinderGeometry(0.46, 0.31, 0.56, 24), materials.shade, [0, 2.02, 0]));
  return group;
}

function createPlant() {
  const group = new Group();
  group.add(mesh(new CylinderGeometry(0.42, 0.34, 0.64, 20), materials.pot, [0, 0.32, 0]));
  group.add(mesh(new CylinderGeometry(0.08, 0.06, 1.15, 12), materials.wood, [0, 1.16, 0]));
  const leafGeometry = new SphereGeometry(0.46, 16, 12);
  const leaves = [[0.28, 1.55, 0], [-0.3, 1.48, 0.08], [0, 1.82, 0.18], [0.08, 1.3, -0.27], [-0.12, 1.98, -0.15]];
  for (const [x, y, z] of leaves) {
    const leaf = mesh(leafGeometry, materials.leaf, [x, y, z]);
    leaf.scale.set(1, 0.52, 0.7);
    group.add(leaf);
  }
  return group;
}

async function exportModel(name, object) {
  const scene = new Scene();
  scene.add(object);
  const result = await exporter.parseAsync(scene, { binary: true, onlyVisible: true });
  await writeFile(new URL(`${name}.glb`, outputDirectory), Buffer.from(result));
}

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  exportModel("sofa", createSofa()),
  exportModel("lamp", createLamp()),
  exportModel("plant", createPlant()),
]);

console.log("Generated sofa.glb, lamp.glb, and plant.glb in public/models.");
